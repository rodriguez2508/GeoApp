import Swal, { SweetAlertIcon } from 'sweetalert2';
import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { I_UserSessionStorage } from '../../interface/user.interface';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { I_FormTravelRequest } from '../../interface/trip.interface';



@Injectable({
  providedIn: 'root'
})
export class DataTravelerService {


  // TODO -- data de Viaje
  travels$: I_FormTravelRequest = {
    id: '',
    origin_coordinate: '',
    destination_coordinate: '',
    destination_address: '',
    origin_address: '',
    status: '',
    driver_id: '',
    traveler_id: '',
    vehicleType: '',
    personNumber: '',
    maxTimeWaiting: '',
    travelPeferences: ''
  };

  travelsSubject = new BehaviorSubject<I_FormTravelRequest>(this.travels$);  

  // ---------------------------------------------------
  //TODO -- establece la data a los viajes
  // ---------------------------------------------------
  setTravelData(travelData: I_FormTravelRequest | null) {


    if (travelData === null) {

      this.travels$ = {
        id: '',
        origin_coordinate: '',
        destination_coordinate: '',
        destination_address: '',
        origin_address: '',
        status: '',
        driver_id: '',
        traveler_id: '',
        vehicleType: '',
        personNumber: '',
        maxTimeWaiting: '',
        travelPeferences: ''
      };

      this.travelsSubject.next(this.travels$);

    } else {
      this.travels$ = travelData;
      this.travelsSubject.next(travelData);
    }


  }
  getTravelData(): Observable<I_FormTravelRequest> {


    return this.travelsSubject.asObservable();
  }
  // ---------------------------------------------------
  //TODO -- establece la data a los viajes
  // ---------------------------------------------------


}


