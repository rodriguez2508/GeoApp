import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';

// -- módulo que para generar ID
import { v4 as uuidv4 } from 'uuid';

// -- modulo para manejar token
// import * as jwt from 'jsonwebtoken';
import * as jws from 'jws';

import { Client } from './../interface/client.interface';
import { DataService } from './data.service';
import { StorageService } from './storage.service';


const AUTH_API = 'http://localhost:8080/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({

  providedIn: 'root',
})

// const newId = uuidv4();

//     let userData:Client = {
//       id: newId,
//       name: credentials.user,
//       online: true

//     };
export class SessionService {

  constructor(private http: HttpClient, private dataService: DataService, private storageService: StorageService) { }


  // ----------------------------------
  // -- funcion para iniciar sesion  
  // ----------------------------------
  signin(credentials: any): boolean {

    const newId = uuidv4();

    let userData: Client = {
      id: newId,
      name: credentials.user_name,
      markerColor:'transparent'

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
  signup(credentials: any) {

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

    if (this.storageService.isLoggedIn()) {

      // -- asignar true a la sesion actual del usuario
      this.dataService.setUserLoggedIn(true);

      return true;
    }

    // -- asignar false a la sesion actual del usuario
    this.dataService.setUserLoggedIn(false);
    return false;
  }


  private f_createToken(user: Client): string {

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
