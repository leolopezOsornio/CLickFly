import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.prod';
import { Observable, BehaviorSubject } from 'rxjs';
import { ToastController } from '@ionic/angular';
import {
  AlertController,
  NavController,
  LoadingController,
} from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  private hasToken(): boolean {
    return (
      !!localStorage.getItem('authToken') && !!localStorage.getItem('usuario')
    );
  }

  // Login y guardar datos directamente desde el servicio
  login(username: string, password: string): Observable<any> {
    return this.http
      .post(`${environment.ApiBackend}auth/login`, {
        username,
        password,
      })
      .pipe(
        tap((response: any) => {
          // Guardar los datos del usuario en localStorage
          localStorage.setItem('authToken', response.token);
          localStorage.setItem(
            'usuario',
            JSON.stringify({
              nombreCompleto: response.datosUser.nombreCompleto,
              usuario: response.datosUser.usuario,
              email: response.datosUser.email,
            })
          );
        })
      );
  }
  // Registrar un usuario
  register(
    email: string,
    fullName: string,
    username: string,
    password: string
  ): Observable<any> {
    return this.http.post(`${environment.ApiBackend}auth/register`, {
      email,
      fullName,
      username,
      password,
    });
  }

  // ------- CORREOS ------
  // ➡️ Traemos el token de local storage
  traerToken(): string | null {
    const token = localStorage.getItem('authToken');
    // console.log(token)
    return token;
  }

  // ➡️ traemos mis correos
  traerCorreos(): Observable<any> {
    const token = this.traerToken();

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(
      `${environment.ApiBackend}correos/traerCorreos`,
      {},
      { headers }
    );
  }

  // ➡️ agrego un nuevo correo a la base de datosss
  insertarCorreo(data: any): Observable<any> {
    const token = this.traerToken();

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(
      `${environment.ApiBackend}correos/insertarCorreos`,
      data,
      { headers }
    );
  }

  // ➡️ Eliminar un correo
  eliminarCorreo(correoId: any): Observable<any> {
    const token = this.traerToken();

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(
      `${environment.ApiBackend}correos/eliminarCorreo`,
      { correoId },
      { headers }
    );
  }

  // ➡️ editar correo
  updateCorreo(data: any): Observable<any> {
    const token = this.traerToken();

    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.post(
      `${environment.ApiBackend}correos/editarCorreo`,
      { data },
      { headers }
    );
  }

  // --------- 😡 Función para mostrar mensajes en la pantalla
  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 4000,
      color: color,
      position: 'bottom',
    });
    await toast.present();
  }
}
