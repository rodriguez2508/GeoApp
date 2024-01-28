import Swal, { SweetAlertIcon } from 'sweetalert2';
import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';


import { Client } from './../interface/client.interface';
import { StorageService } from './storage.service';


const API_URL = 'http://localhost:8080/api/test/';


@Injectable({
  providedIn: 'root'
})
export class DataService {
 
  private userLoggedInSubject = new BehaviorSubject<boolean>(false);


  Msj: string = '';
  MsjCode: string = '';
  RouteName: string = '';

  constructor(private router: Router, private storageService: StorageService) {

  }

  // --------------------------------------------------------
  // ----------------------------
  // -- Para verificar la sesion 


  setUserLoggedIn(value: boolean) {

    this.userLoggedInSubject.next(value);
  }

  // -------------------------------------
  
  // -------------------------------------
  getUserLoggedIn(): Observable<boolean> {
 
    return this.userLoggedInSubject.asObservable();

  }


  // -- Para verificar la sesion 
  // ----------------------------
  // --------------------------------------------------------


  // --------------------------------------------------------
  // -- message -> 'Texto a mostrar'
  // -- code -> 'success' | 'warning' | 'danger'
  // -- _route -> 'route/to/view' | ''
  showMsjInData(message: string, code: string, _route: string) {
    setTimeout(() => {
      this.MsjCode = code;
      this.Msj = message;
    }, 200);
    setTimeout(() => {
      this.MsjCode = code;
      this.Msj = '';
    }, 3999);
    setTimeout(() => {
      if (_route != '') {
        this.router.navigate([_route]);
      }
    }, 4004);
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
