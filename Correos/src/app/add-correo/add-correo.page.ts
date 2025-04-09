import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ToastController } from '@ionic/angular';
import { Router, NavigationStart } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-add-correo',
  templateUrl: './add-correo.page.html',
  styleUrls: ['./add-correo.page.scss'],
  standalone: false,
})
export class AddCorreoPage implements OnInit {
  correoForm: FormGroup;
  isLoading = false;
  imagenUrl: string | null = null;
  imagenBase64: string | null = null;
  public isLargeScreen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router,
    private navCtrl: NavController,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController
  ) {
    this.correoForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      nombre: ['', Validators.required],
      nota: ['', Validators.required],
      imagen: [''], // Campo opcional para la imagen
    });
  }

  // cambios tiempo real el tamaño de la fantalla sirve para sabes si estoy en un dispocitivo pequeño y asi hacer cambios en html
  @HostListener('window:resize', ['$event'])
  updateScreenSize() {
    this.isLargeScreen = window.innerWidth >= 765;
  }

  ngOnInit() {
    const userStorage = JSON.parse(localStorage.getItem('usuario') || 'null');
    const token = localStorage.getItem('authToken');
    if (!userStorage || !token) {
      this.navCtrl.navigateBack('/home');
      return;
    }
  }

  async enviarFormulario() {
    if (this.correoForm.invalid) {
      this.authService.mostrarToast(
        'Por favor, completa todos los campos correctamente',
        'warning'
      );
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      // Obtener ubicación del dispositivo
      const { latitude, longitude } = await this.getLocation();

      if (!latitude || !longitude) {
        await loading.dismiss();
        this.authService.mostrarToast(
          'No se pudo obtener la ubicación',
          'danger'
        );
        return;
      }

      // Agregar ubicación al formulario
      const formData = {
        ...this.correoForm.value,
        latitud: latitude,
        longitud: longitude,
      };

      // Enviar datos al backend
      this.authService.insertarCorreo(formData).subscribe({
        next: async (res) => {
          this.authService.mostrarToast(res.message, 'success');
          this.correoForm.reset();
          this.router.navigate(['/inicio']);
          await loading.dismiss();
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
      this.authService.mostrarToast(
        'No se pudo obtener la ubicación',
        'danger'
      );
      console.error('Error obteniendo ubicación:', error);
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
        this.imagenUrl = `data:image/jpeg;base64,${image.base64String}`;
        this.correoForm.patchValue({ imagen: this.imagenBase64 });
      }
    } catch (error) {
      this.authService.mostrarToast(
        'No se pudo seleccionar la imagen',
        'danger'
      );
      console.error('Error al seleccionar imagen:', error);
    }
  }

  async getLocation(): Promise<{ latitude: number; longitude: number }> {
    if (Capacitor.isNativePlatform()) {
      try {
        // Solicitar permisos en plataformas nativas
        const permissionStatus = await Geolocation.requestPermissions();
        if (permissionStatus.location === 'granted') {
          // Obtener ubicación
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true, // Precisión alta
          });
          return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } else {
          console.error('Permisos de geolocalización denegados.');
          return { latitude: 0, longitude: 0 }; // Valores predeterminados
        }
      } catch (error) {
        console.error('Error obteniendo la ubicación:', error);
        return { latitude: 0, longitude: 0 }; // Valores predeterminados
      }
    } else {
      // Usar la API de Geolocalización de HTML5 para la web
      return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              console.error('Error obteniendo la ubicación:', error);
              resolve({ latitude: 0, longitude: 0 }); // Valores predeterminados
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          console.error('Geolocalización no soportada por el navegador.');
          resolve({ latitude: 0, longitude: 0 }); // Valores predeterminados
        }
      });
    }
  }
}
