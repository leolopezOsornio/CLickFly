import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  NavController,
  LoadingController,
} from '@ionic/angular';
import { AuthService } from '../services/auth.service'; // Importa el servicio

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  username: string = '';
  password: string = '';
  isValid = false;
  isLoading = true;
  showLoginSpinner = false;

  passwordVisible: boolean = false;

  constructor(
    private alertController: AlertController,
    private navCtrl: NavController,
    private loadingController: LoadingController,
    private authService: AuthService // Inyecta el servicio
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false;
    }, 3000);

    const userStorage = JSON.parse(localStorage.getItem('usuario') || 'null');
    const token = localStorage.getItem('authToken');
    if (userStorage || token) {
      this.navCtrl.navigateBack('/inicio');
      return;
    }
  }

  async login() {
    this.validateFields();
    if (!this.isValid) {
      this.authService.showAlert(
        'Error',
        'Por favor ingrese un nombre de usuario y contraseña válidos.'
      );
      return;
    }

    this.showLoginSpinner = true;

    this.authService.login(this.username, this.password).subscribe({
      next: async (response) => {
        await this.showLoadingLoginSuccess();
        // this.navCtrl.navigateForward('/inicio');
        window.location.href = '/inicio';
      },
      error: async (error) => {
        console.error('Error al hacer login:', error); // Verifica si hay algún error detallado en el backend
        this.authService.showAlert(
          'Error',
          'Usuario o contraseña incorrectos.'
        );
        this.showLoginSpinner = false;
      },
    });
  }

  goToRegister() {
    this.navCtrl.navigateForward('/register');
  }

  validateFields() {
    this.isValid = this.username.trim() !== '' && this.password.trim() !== '';
  }

  async showLoadingLoginSuccess() {
    const loading = await this.loadingController.create({
      spinner: 'crescent',
      message: 'Verificando credenciales...',
      duration: 3000,
    });
    await loading.present();
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

}
