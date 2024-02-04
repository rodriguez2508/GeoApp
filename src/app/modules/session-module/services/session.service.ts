 
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

// -- módulo que para generar ID
import { v4 as uuidv4 } from 'uuid';

// -- modulo para manejar token
// import * as jwt from 'jsonwebtoken';
import * as jws from 'jws';

// -- Interfaces
import { I_UserSessionStorage } from '../../../interface/user.interface';
import { I_SignIn, I_SignUp } from '../../../interface/session.interface';
// -- Interfaces
// -- Services
import { DataService } from '../../../services/data.service';
import { StorageService } from '../../../services/storage.service'; 
// -- Services
 


const AUTH_API = 'http://localhost:8080/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({

  providedIn: 'root',
})

export class SessionService {

  constructor(private http: HttpClient, private dataService: DataService, private storageService: StorageService) { }


  // ----------------------------------
  // -- funcion para iniciar sesion  
  // ----------------------------------
  signin(credentials: I_SignIn): boolean {

    const newId = uuidv4();

    const userData: I_UserSessionStorage = {
      id: newId,
      user_name: credentials.user_name,
      user_type: credentials.user_type,

    };

    // -- Verificar que las credenciales sean correctas
    const credentialsStatus: boolean = Boolean(credentials.password === '123456');


    // -- Credenciales OK, crea un token, lo guarda en sesionStorage
    if (credentialsStatus) {

      try {

        // const token = this.f_createToken(userData);

        // -- asignar true a la sesion actual del usuario
        this.dataService.setUserLoggedIn(true);

        this.storageService.saveUser(userData);

        return true;

      } catch (error) {
        console.error('Error ecoding token:', error);
        return false;
      }

    }
    console.error('Error invalid credentials');
    return false;
  }



  // ----------------------------------
  // -- funcion para registrarse  
  // ----------------------------------
  signup(credentials: I_SignUp): boolean {

    // --Datos del usuario recivido del for
    let userData: I_SignUp = {

      user_type: credentials.user_type,
      ci: credentials.ci,
      email: credentials.email,
      name: credentials.name,
      phone: credentials.phone,
      code: credentials.code,
      password: credentials.password,
      password_rpt: credentials.password_rpt,

    };

    // -- Verificar que las datos sean correctas 

    return this.signin({ user_name: userData.name, password: userData.password, user_type: userData.user_type });

  }


  // ----------------------------------
  // -- funcion para cerrar sesion  
  // ----------------------------------
  signout() {

    // -- asignar true a la sesion actual del usuario
    this.dataService.setUserLoggedIn(false);

    this.storageService.clean();

  }

  // ----------------------------------
  // -- funcion para verificar la sesion 
  // ----------------------------------
  public isAuthenticated(): boolean {
    // const token: string = this.f_getToken();

    const isLoggedIn = this.storageService.isLoggedIn();
    // -- asignar true a la sesion actual del usuario
    this.dataService.setUserLoggedIn(isLoggedIn);
    return isLoggedIn;

  }


  private f_createToken(user: I_UserSessionStorage): string {

    // // Set your secret key for signing the token
    // const secret = 'session';

    // // Set the token expiration time (in seconds)
    // const expiresIn = 86400; // 24 hours, you can adjust this as needed

    // // Create the token using the user information and secret key
    // const token = jwt.sign({ user }, secret, { expiresIn, algorithm: 'HS256' });


    // return token;
    return "";
  }

  private f_getToken(): string {
    // Implementa la lógica para obtener el token desde donde lo hayas almacenado
    // Por ejemplo, localStorage, sessionStorage, etc.
    return '...'; // Reemplaza con tu lógica de obtención de token
  }

  private f_decodificarJwt(token: string): any {
    // Implementa la lógica para decodificar el token utilizando la biblioteca jsonwebtoken
    try {
      const decodedToken = "";
      // const decodedToken = jwt.verify(token, 'session');
      return decodedToken;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }


  //  -----------------------------
  //  -----------------------------
  login(username: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signin',
      {
        username,
        password,
      },
      httpOptions
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signup',
      {
        username,
        email,
        password,
      },
      httpOptions
    );
  }

  logout(): Observable<any> {
    return this.http.post(AUTH_API + 'signout', {}, httpOptions);
  }
}
