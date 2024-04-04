import Swal, { SweetAlertIcon } from 'sweetalert2';
import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { I_UserSessionStorage } from '../../interface/user.interface';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { I_FormTravelRequest } from '../../interface/trip.interface';
import { Coordinate } from 'ol/coordinate';
import { I_Offers } from '../../interface/offers';



@Injectable({
  providedIn: 'root'
})
export class DataTravelerService {


  // ---------------------------------------------------
  //TODO -- establece la data del usuario  INICIO
  // ---------------------------------------------------
  userData$: I_UserSessionStorage = {
    id: '',
    ci: '',
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone: '',
    user_type: ''
  };

  userDataSubject = new BehaviorSubject<I_UserSessionStorage>(this.userData$);

  setUserData(userData: I_UserSessionStorage | null) {


    if (userData === null) {

      this.userData$ = {
        id: '',
        ci: '',
        name: '',
        email: '',
        exp: 0,
        iat: 0,
        phone: '',
        user_type: ''
      };

      this.userDataSubject.next(this.userData$);

    } else {
      this.userData$ = userData;
      this.userDataSubject.next(userData);
    }


  }
  getUserData(): Observable<I_UserSessionStorage> {


    return this.userDataSubject.asObservable();
  }


  // ---------------------------------------------------
  //TODO -- establece la data del usuario  FINAL
  // ---------------------------------------------------
  
  // ---------------------------------------------------
  //TODO -- establece la data a los viajes  INICIO
  // ---------------------------------------------------
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
  //TODO -- establece la data a los viajes FINAL
  // ---------------------------------------------------




  // ---------------------------------------------------
  //TODO -- establece la status del socket INICIO
  // ---------------------------------------------------
  socketStatus$: boolean = false;

  socketStatusSubject = new BehaviorSubject<boolean>(this.socketStatus$);

  setSocketStatus(socketStatusData: boolean | null) {


    if (socketStatusData === null) {

      this.socketStatus$ = false;

      this.socketStatusSubject.next(this.socketStatus$);

    } else {
      this.socketStatus$ = socketStatusData;
      this.socketStatusSubject.next(socketStatusData);
    }


  }
  getSocketStatus(): Observable<boolean> {


    return this.socketStatusSubject.asObservable();
  }
  // ---------------------------------------------------
  //TODO -- establece la status del socket FINAL
  // ---------------------------------------------------



  // ---------------------------------------------------
  //TODO -- establece la status del Location INICIO
  // ---------------------------------------------------
  location$: Coordinate = [0,0];

  locationSubject = new BehaviorSubject<Coordinate>(this.location$);

  setLocation(locationData: Coordinate | null) {


    if (locationData === null) {

      this.location$ = [0,0];

      this.locationSubject.next(this.location$);

    } else {
      this.location$ = locationData;
      this.locationSubject.next(locationData);
    }


  }
  getLocation(): Observable<Coordinate> {


    return this.locationSubject.asObservable();
  }
  // ---------------------------------------------------
  //TODO -- establece la status del socket FINAL
  // ---------------------------------------------------



  // ---------------------------------------------------
  //TODO -- establece la data de offers INICIO
  // ---------------------------------------------------
  offers$: I_Offers[] = [];

  offersSubject = new BehaviorSubject<I_Offers[]>(this.offers$);


  setOffers(offersData: I_Offers[] | null) {


    if (offersData === null) {

      this.offers$ = [];

      this.offersSubject.next(this.offers$);

    } else {
      this.offers$ = offersData;
      this.offersSubject.next(offersData);
    }


  }
  getOffers(): Observable<I_Offers[]> {


    return this.offersSubject.asObservable();
  }
  // ---------------------------------------------------
  //TODO -- establece la data de offers FINAL
  // ---------------------------------------------------



}


