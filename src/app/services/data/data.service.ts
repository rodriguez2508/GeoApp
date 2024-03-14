import Swal, { SweetAlertIcon } from 'sweetalert2';
import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { I_UserSessionStorage } from '../../interface/user.interface';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';



@Injectable({
  providedIn: 'root'
})
export class DataService {


  private _snackBar = inject(MatSnackBar);

  private loggedInSubject = new BehaviorSubject<boolean>(false);
  private userDataSubject = new BehaviorSubject<I_UserSessionStorage>({
    id: '',
    ci: '',
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone: '',
    user_type: ''
  });

  loggedIn$ = this.loggedInSubject.asObservable();
  userData$ = this.userDataSubject.asObservable();

  Msj: string = '';
  MsjCode: string = '';
  RouteName: string = '';

  constructor(private router: Router) {

  }

  // -- Para verificar la sesion 
  // ----------------------------
  // --------------------------------------------------------

  getLoggedIn(): Observable<boolean> {
    return this.loggedIn$;
  }
  getuserData(): Observable<I_UserSessionStorage> {
    return this.userData$;
  }

  setLoggedIn(value:boolean) {
    this.loggedInSubject.next(value);
  }
  setuserData(userData:I_UserSessionStorage) {
    this.userDataSubject.next(userData);

  }

  // --------------------------------------------------------
  // -- message -> 'Texto a mostrar'
  // -- code -> 'success' | 'warning' | 'danger'
  // -- _route -> 'route/to/view' | ''
  // showMsjInData(message: string, code: string, _route: string) {
  //   setTimeout(() => {
  //     this.MsjCode = code;
  //     this.Msj = message;
  //   }, 200);
  //   setTimeout(() => {
  //     this.MsjCode = code;
  //     this.Msj = '';
  //   }, 3999);
  //   setTimeout(() => {
  //     if (_route != '') {
  //       this.router.navigate([_route]);
  //     }
  //   }, 4004);
  // }
  openSnackBar(code:string) : MatSnackBarConfig<any> {
    
    if(code == 'success'){
      return {
        duration: 7000,
        verticalPosition: 'bottom',
        horizontalPosition: 'end',
        panelClass: ['success-snackbar'],
      };
    }
    else if(code == 'danger'){

      return {
        duration: 7000,
        verticalPosition: 'bottom',
        horizontalPosition: 'end',
        panelClass: ['error-snackbar'],
      };

    }
     else if(code == 'warning'){

      return {
        duration: 7000,
        verticalPosition: 'bottom',
        horizontalPosition: 'end',
        panelClass: ['warning-snackbar'],
      };

    }
    else {
      return {
        duration: 7000,
        verticalPosition: 'bottom',
        horizontalPosition: 'end',
        panelClass: ['warning-snackbar'],
      };

    }
     
  }

  // -----------------------------------

  showMsj(message: string, title: string, icon: string) {
    Swal.fire(title, message, icon as SweetAlertIcon);
  }

  async showQuestion(message: string, title: string = '', icon: string): Promise<boolean> {
    // Swal.fire(title, message, icon as SweetAlertIcon);

    return await Swal.fire({
      title: message,
      icon: icon as SweetAlertIcon,
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        // Acción a realizar si el usuario confirma
        return true;
      } else {
        // Acción a realizar si el usuario niega
        return false;
      }
    });


  }
}
