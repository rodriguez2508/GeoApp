import { Injectable } from '@angular/core';


// -- modulo para manejar token 
import * as jwtDecode from 'jwt-decode';

import { I_UserSessionStorage } from '../../interface/user.interface';
  

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
 
  constructor( 
    
    
    ) { 
    
  }

  clean(): void {
    localStorage.clear();
  }

  public saveUser(user: I_UserSessionStorage): void {
 
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    // sessionStorage.removeItem(USER_KEY);
    // sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    
    const user = localStorage.getItem(USER_KEY);
     
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }

  public isLoggedIn(): boolean {
 
    // Accede a la propiedad localStorage del objeto window
 

      return localStorage.getItem(USER_KEY) !== null;
  

  }

  // TODO ----- TOKEN   

  f_setToken(token: string, name:string='token') {

    localStorage.setItem(name, token);
 
  }
  decodeToken(token: string): any {
    try {
      return jwtDecode.jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  f_getToken(token: string = "token"): string | null {
      
    return localStorage.getItem(token);
  }
 
  // ------- TOKEN 



  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
