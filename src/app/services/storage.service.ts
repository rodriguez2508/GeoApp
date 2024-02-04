import { Injectable } from '@angular/core';
import { I_UserSessionStorage } from '../interface/user.interface';

const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor() {

    
  }

  clean(): void {
    window.sessionStorage.clear();
  }

  public saveUser(user: I_UserSessionStorage): void {
 
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
     
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }

  public isLoggedIn(): boolean {
 
    // Accede a la propiedad localStorage del objeto window

    

      return window.sessionStorage.getItem(USER_KEY) !== null;
 

    // // Verifica si se está ejecutando el código en un navegador
    // if (this.isBrowser()) {
    //   return window.sessionStorage.getItem(USER_KEY) !== null;
    // } else {
    //   // Devuelve false en caso de que no se esté ejecutando el código en un navegador
    //   return false;
    // }

  }

  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
