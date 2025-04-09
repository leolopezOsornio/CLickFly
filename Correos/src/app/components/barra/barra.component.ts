import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service'; // Importa el servicio
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-barra',
  templateUrl: './barra.component.html',
  styleUrls: ['./barra.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BarraComponent implements OnInit {
  fullName: string = 'heyy';
  public isLoggedIn: boolean = false;
  public isLargeScreen: boolean = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private authService: AuthService,
        private alertController: AlertController,
  ) {
    this.isLargeScreen = window.innerWidth >= 765;
  }

  // cambios tiempo real el tamaño de la fantalla sirve para sabes si estoy en un dispocitivo pequeño y asi hacer cambios en html
  @HostListener('window:resize', ['$event'])
  updateScreenSize() {
    this.isLargeScreen = window.innerWidth >= 765;
  }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
    const usuarioString = localStorage.getItem('usuario');
    if (usuarioString) {
      const usuario = JSON.parse(usuarioString);
      this.fullName = usuario.nombreCompleto;
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Salir de la sesión',
      message: '¿Estás seguro en salir?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salir',
          handler: async () => {
            localStorage.clear();
            // this.navCtrl.navigateBack('/home');
            window.location.href = '/home';
          },
        },
      ],
    });

    await alert.present();
  }
  async navegar(url: string) {
    this.router.navigate([url]);
  }
}
