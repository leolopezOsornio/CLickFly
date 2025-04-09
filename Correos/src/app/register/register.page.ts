import { Component, HostListener } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import * as CryptoJS from 'crypto-js';
import { AuthService } from '../services/auth.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  email: string = '';
  fullName: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';

  formValid: boolean = false;
  emailValid: boolean = true;
  passwordsMatch: boolean = true;
  passwordValid: boolean = true;
  usernameValid: boolean = true;

  public isLargeScreen: boolean = false;

  showPassword = false;
  acceptPolicies = false;

  constructor(
    public navCtrl: NavController,
    private alertController: AlertController,
    private firestore: Firestore,
    private authService: AuthService,
    private loadingController: LoadingController
  ) {
    this.isLargeScreen = window.innerWidth >= 765;
  }

  // cambios tiempo real el tamaño de la fantalla sirve para sabes si estoy en un dispocitivo pequeño y asi hacer cambios en html
  @HostListener('window:resize', ['$event'])
  updateScreenSize() {
    this.isLargeScreen = window.innerWidth >= 765;
  }

  validateForm() {
    this.emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    this.usernameValid = !this.username.includes(' ');
    this.passwordsMatch = this.password === this.confirmPassword;

    this.formValid =
      this.emailValid &&
      this.email.trim() !== '' &&
      this.fullName.trim() !== '' &&
      this.usernameValid &&
      this.username.trim() !== '' &&
      this.password.trim() !== '' &&
      this.passwordValid &&
      this.passwordsMatch;
  }

  validatePassword() {
    this.passwordValid =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        this.password
      );
    this.validateForm();
  }

  formatFullName() {
    // Esta linea convierte todo a muyusculas
    // this.fullName = this.fullName.toUpperCase();
    this.validateForm();
  }

  removeSpaces() {
    this.username = this.username.replace(/\s/g, '');
    this.validateForm();
  }

  async checkIfUserExists() {
    const usersCollection = collection(this.firestore, 'users');
    const qEmail = query(usersCollection, where('email', '==', this.email));
    const qUsername = query(
      usersCollection,
      where('username', '==', this.username)
    );

    const emailSnapshot = await getDocs(qEmail);
    const usernameSnapshot = await getDocs(qUsername);

    if (!emailSnapshot.empty) {
      return 'El email ya está registrado';
    }
    if (!usernameSnapshot.empty) {
      return 'El nombre de usuario ya está registrado';
    }
    return null;
  }

  async registerUser() {
    if (!this.formValid) return;

    const loading = await this.loadingController.create({
      message: 'Registrando...',
      spinner: 'crescent',
    });
    await loading.present();

    try {
      const email = this.email;
      const fullName = this.fullName;
      const username = this.username;
      const password = this.password;

      this.authService.register(email, fullName, username, password).subscribe({
        next: async (response) => {
          await loading.dismiss();
          // setTimeout(() => {
            this.authService.showAlert(
              '✅ Bienvenido',
              'Tu registro ha sido exitoso'
            );
            this.navCtrl.navigateBack('/home');
            // console.log(response)
          // }, 2000);
        },
        error: async (error) => {
          await loading.dismiss();
          let errorMessage = '❌ Error desconocido. Inténtalo nuevamente.';

          if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.authService.showAlert('Ups! Algo salió mal', errorMessage);
          console.log(error);
        },
      });

      // this.navCtrl.navigateBack('/home');
    } catch (error) {
      await loading.dismiss();
      console.error('Error al registrar usuario en Firestore:', error);

      const alert = await this.alertController.create({
        header: 'Error',
        message:
          'Hubo un problema al registrar el usuario. Inténtalo de nuevo.',
        buttons: ['OK'],
      });
      await alert.present();
    }
  }
}
