import { environment } from '../../../environments/environment';

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

// -- módulo que para generar ID
import { v4 as uuidv4 } from 'uuid';


// -- Interfaces
import { I_SignIn, I_SignInGoogle, I_SignUp } from '../../interface/session.interface';
// -- Interfaces
// -- Services
import { DataService } from '../data/data.service';
import { Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';
import { Auth, UserCredential, authState, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { signInWithEmailAndPassword } from 'firebase/auth';
// -- Services 

const AUTH_API = environment.AUTH_API;

@Injectable({

  providedIn: 'root',
})

export class SessionService {

  
  private apiUrl = '/api/v1/auth/'; // Ajusta la URL seg�n la estructura de tu backend

  // -- Firebase variables
  private auth:Auth = inject(Auth);
  readonly authState$ = authState(this.auth);


  token: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(private http: HttpClient, private dataService: DataService, private router: Router, private storageService: StorageService) { }


  // ----------------------------------
  // TODO funcion para iniciar sesion  
  // ----------------------------------
  signin(credentials: I_SignIn): Observable<any> {

    const url = AUTH_API + 'login';

    const userData: I_SignInGoogle = {
      user: credentials.user_name,
      password: credentials.password
    };

    return this.http.post<any>(url, userData).pipe(

      tap((data: any) => {

        const decodedToken = this.storageService.decodeToken(data.token); // Decodifica el token

        this.storageService.saveUser(decodedToken);
        // -- guardar token
        this.storageService.f_setToken(data.token);
      }),


      catchError(this.handleError)
    );

  }

  // ----------------------------------
  // TODO funcion para iniciar sesion google
  // ----------------------------------
  signin_google(email: string): Observable<any> {

    const url = AUTH_API + 'login_google';

    const userData: { user: string} = {
      user: email, 
    };

    return this.http.post<any>(url, userData).pipe(

      tap((data: any) => {

        const decodedToken = this.storageService.decodeToken(data.token); // Decodifica el token

        this.storageService.saveUser(decodedToken);
        // -- guardar token
        this.storageService.f_setToken(data.token);
      }),


      catchError(this.handleError)
    );

  }


  // -- login con firebase

  signinWithFirebase(credentials: {email:string, password:string}): Promise<UserCredential>{
    return createUserWithEmailAndPassword(this.auth, credentials.email, credentials.password);
  }


  // ----------------------------------
  //  TODO funcion para registrarse  
  // ----------------------------------
  signup(credentials: I_SignUp): Observable<any> {

    const url = AUTH_API + 'register';

    const userData: {
      user_type: string,
      ci: string,
      email: string,
      name: string,
      phone: string,
      password: string,
    } = {
      user_type: credentials.user_type,
      ci: credentials.ci,
      email: credentials.email,
      name: credentials.name,
      phone: credentials.phone,
      password: credentials.password,
    };

    if (userData.password != credentials.password_rpt) {
      return throwError(() => new Error('Contraseñas no coinciden.'));
    }
    // -- Verificar que las datos sean correctas 

    return this.http.post<any>(url, userData).pipe(

      tap((data: any) => {
        // -- guardar token
        this.storageService.f_setToken(data.token);

        const decodedToken = this.storageService.decodeToken(data.token); // Decodifica el token

        this.storageService.saveUser(decodedToken);

      }),

      catchError(this.handleError)
    );

  }


  // -- registrarse con firebase

  signupWithFirebase(credentials: {email:string, password:string}): Promise<UserCredential>{
    return signInWithEmailAndPassword(this.auth, credentials.email, credentials.password);
  }


  // ----------------------------------
  //  TODO funcion para cerrar sesion  
  // ----------------------------------
  signout() {

    this.dataService.setLoggedIn(false); 
    this.storageService.clean();
    this.auth.signOut();

  }

  public isAuthenticated(): boolean {

    const token: string | null = this.storageService.f_getToken(); // Obtén el token almacenado

    if (token !== null) {
      try {
        const decodedToken = this.storageService.decodeToken(token); // Decodifica el token

        // Verifica la fecha de expiración
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (decodedToken.exp && decodedToken.exp < currentTimestamp) {

          this.dataService.showMsj('Su sesión ha expirado', 'Alert', 'warning');

          console.log('El token ha caducado.');
          this.dataService.setLoggedIn(false); 
          this.storageService.clean();

          return false;
        }

        // Resto del código para configurar la autenticación 


        return true;
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        this.storageService.clean();
        this.dataService.setLoggedIn(false); 

        return false;
      }
    } else {
      console.log('No se encontró un token.');
      this.storageService.clean();
      this.dataService.setLoggedIn(false); 

      return false;
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.log('Se ha producido un error ', error.error); 
      this.dataService.showMsj('Ha ocurriddo un error, por favor intente más tarde.', 'Error.', 'danger');

    } else if (error.status === 400) { 
      console.error('Error en la petición ' + error.status)

    } else if (error.status === 401) {
 
      console.error('Sin Autorización! ' + error.status) ;
      this.dataService.showMsj('Credenciales Incorrectas, por favor rectifique.', 'Error.', 'danger');

    } else if (error.status === 500) {
 
      console.error('Error en el Servidor ' + error.status) ;
      this.dataService.showMsj('Ha ocurriddo un error, por favor si es posible comuníquese con nosotros.', 'Error.', 'danger');

    }
    else{
    }
    return throwError(() => new Error(`${error.status}`));

    
  }




}
