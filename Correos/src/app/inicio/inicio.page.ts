import { Component, OnInit, HostListener } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { AuthService } from '../services/auth.service'; // Importa el servicio
import { AlertController } from '@ionic/angular';
import { EditarComponent } from '../components/editar/editar.component'; // Importa el componente editar
import { ModalComponent } from '../components/modal/modal.component'; // Importa la modal

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: false,
})

export class InicioPage implements OnInit {
  emails: any[] = [];
  newEmail: any = { id: '', destinatario: '', asunto: '', contenido: '' };
  emailValid: boolean = true;
  formValid: boolean = false;
  fullName: string = '';
  isTokenValid: boolean = false;
  isModalOpen: boolean = false; // Para controlar el estado del modal
  editingEmail: any = null; // Correo que se está editando
  public isLargeScreen: boolean = false;

  // Se guardalos correos q trae de la base de datos
  correos: any[] = [];

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private alertController: AlertController,
    private modalController: ModalController
  ) {
    this.isLargeScreen = window.innerWidth >= 765;
  }

  ngOnInit() {
    const userStorage = JSON.parse(localStorage.getItem('usuario') || 'null');
    const token = localStorage.getItem('authToken');
    if (!userStorage || !token) {
      this.navCtrl.navigateBack('/home');
      return;
    }
    this.fullName = userStorage.nombreCompleto;
    this.isTokenValid = true;
    this.loadEmails();
  }

  ionViewWillEnter() {
    this.loadEmails();
  }

  // Trae los correos desde la BD y los guarda en localStorage
  async loadEmails() {
    this.authService.traerCorreos().subscribe({
      next: (response) => {
        localStorage.setItem('correos', JSON.stringify(response));
        this.correos = response;
      },
      error: (error) => {
        console.error('Error al traer los correos:', error);
        this.cargarCorreosDesdeLocalStorage();
      },
    });
  }

  // Cargar correos desde localStorage
  cargarCorreosDesdeLocalStorage() {
    const correosGuardados = localStorage.getItem('correos');
    if (correosGuardados) {
      this.correos = JSON.parse(correosGuardados); // Actualiza con los correos guardados
    } else {
      console.log('No hay correos guardados en localStorage');
    }
  }

  logout() {
    localStorage.clear();
    this.navCtrl.navigateBack('/home');
  }

  async editarCorreo(correo: any) {
    const modal = await this.modalController.create({
      component: EditarComponent,  // Cargamos el componente de edición
      componentProps: { correo },  // Le pasamos el correo como propiedad al modal
    });

    modal.onDidDismiss().then((data) => {
      if (data.data?.updated) {
        this.loadEmails();  // Si se actualizó el correo, recargamos la lista de correos
      }
    });

    return await modal.present();
  }

  async eliminarCorreo(correoId: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que quieres eliminar este correo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          handler: async () => {
            this.authService.eliminarCorreo(correoId).subscribe({
              next: () => {
                this.authService.mostrarToast('Correo eliminado con éxito', 'success');
                this.loadEmails();
              },
              error: (error) => {
                console.error('Error al eliminar el correo:', error);
                this.authService.mostrarToast('Error al eliminar el correo', 'danger');
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async mostrarCorreo(correo: any) {
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: { correo }, // Pasamos el correo seleccionado al modal
    });

    return await modal.present();
  }

}
