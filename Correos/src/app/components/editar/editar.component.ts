import { Component, OnInit, Input, ChangeDetectorRef, HostListener } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LoadingController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditarComponent implements OnInit {
  @Input() correo: any = {}; // Inicializa con un objeto vacío

  imagenUrl: string | null = null;
  imagenBase64: string | null = null;
  public isLargeScreen: boolean = false;

  constructor(
    private modalController: ModalController,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController
 ) {
    this.isLargeScreen = window.innerWidth >= 765;
  }

  // cambios tiempo real el tamaño de la fantalla sirve para sabes si estoy en un dispocitivo pequeño y asi hacer cambios en html
  @HostListener('window:resize', ['$event'])
  updateScreenSize() {
    this.isLargeScreen = window.innerWidth >= 765;
  }

  ngOnInit() {
    if (this.correo && this.correo.imagen) {
      this.imagenUrl = this.correo.imagen;
    }
  }

  // Cerrar el modal
  closeModal() {
    this.modalController.dismiss();
  }

  // Actualizar el correo
  async updateCorreo() {
    const loading = await this.loadingController.create({
      message: 'Guardando...',
      spinner: 'crescent',
    });
    await loading.present();
    try {
      // console.log(this.correo);
      this.authService.updateCorreo(this.correo).subscribe({
        next: async (res) => {
          this.authService.mostrarToast(res.message, 'success');
          await loading.dismiss();
          this.closeModal();
        },
        error: async (err) => {
          this.authService.mostrarToast(
            err.error.message || 'Error al guardar',
            'danger'
          );
          await loading.dismiss();
        },
      });
    } catch (error) {
      console.error('Error al actualizar el correo:', error);
      await loading.dismiss();
    }
  }

  // Método para seleccionar la imagen
  async seleccionarImagen() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar imagen',
      buttons: [
        {
          text: 'Tomar una foto',
          icon: 'camera',
          handler: () => this.obtenerImagen(CameraSource.Camera),
        },
        {
          text: 'Elegir de la galería',
          icon: 'image',
          handler: () => this.obtenerImagen(CameraSource.Photos),
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }

  // Método para capturar o elegir imagen
  async obtenerImagen(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source,
      });

      if (image.base64String) {
        this.imagenBase64 = image.base64String;
        this.correo.imagen = `data:image/jpeg;base64,${image.base64String}`;
        this.imagenUrl = this.correo.imagen;
      }
    } catch (error) {
      this.authService.mostrarToast(
        'No se pudo seleccionar la imagen',
        'danger'
      );
      console.error('Error al seleccionar imagen:', error);
    }
  }

  // Validación del formato del correo
  isEmailValid(): boolean {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(this.correo.correo);
  }

  // Verificar si el nombre y la nota están vacíos
  isFormValid(): boolean {
    return (
      this.isEmailValid() &&
      this.correo.nombre !== '' &&
      this.correo.nota !== ''
    );
  }
}
