import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../data/data.service';
import { StorageService } from '../storage/storage.service';
import { I_FormTravelRequest } from '../../interface/trip.interface';
import { Observable, catchError, tap, throwError } from 'rxjs';


const BASE_URL = environment.TRIP_API;



@Injectable({
  providedIn: 'root'
})

export class TripTravelerService {

  constructor(
    private http: HttpClient,
    private dataService: DataService,
    private router: Router,
    private storageService: StorageService
  ) { }



  // ----------------------------------
  // TODO: funcion para guardar formulario de solicitud de viaje   
  // ----------------------------------
  saveTravelRequest(dataForm: any, user_id:string): Observable<any> {

    // "origin_coordinate": "0,0",
    // "destination_coordinate": "0,0",
    // "destination_address": "some",
    // "origin_address": "sdada",
    // "status": "asdas",  
    // "driver_id": "asdas",   
    // "traveler_id": "67e900c9-1240-4e4d-80d5-aa8f9e018934",
    // "personNumber": "string", 
    // "maxTimeWaiting": "15",
    // "travelPeferences": "" 

    console.log(dataForm)
    const travelData: I_FormTravelRequest = {
      origin_coordinate: dataForm.placeOrigin,
      destination_coordinate: dataForm.placeDestination,
      
      origin_address: dataForm.origin_address,
      destination_address: dataForm.destination_address,
      
      status: 'pending',
      traveler_id: user_id,
      driver_id: "",
      personNumber: dataForm.personNumber,
      maxTimeWaiting: dataForm.maxTimeWaiting,
      travelPeferences: dataForm.travelPeferences,
    };
 

    const url = BASE_URL ; 

    return this.http.post<any>(url, travelData).pipe(

      tap((data: any) => {

        console.log('Travel Request', data);
      }),


      catchError(this.handleError)
    );


  } 
   // ----------------------------------
  // TODO: funcion para obtener Viajes realizados   
  // ----------------------------------
  getTravels(user_id:string, status:string = 'all'): Observable<any> { 


  const url = `${BASE_URL}by_traveler/${user_id}/${status}`;

  return this.http.get<any>(url).pipe(
    tap((data: any) => {
      if (!data || data.length === 0) {
        console.log('No data found');
        // Puedes manejar esto según tus necesidades
      } else {
        console.log(data);
        // Realizar acciones con los datos si es necesario
      }
    }),
    catchError((error) => {
      console.error(error);
      return throwError('Error retrieving items');
    })
  );



  }
  // ----------------------------------
  // TODO: funcion para actualizar formulario de solicitud de viaje   
  // ----------------------------------
  updateTravelRequest(data: any, id:string) {
  
    // "origin_coordinate": "0,0",
    // "destination_coordinate": "0,0",
    // "destination_address": "some",
    // "origin_address": "sdada",
    // "status": "asdas",  
    // "driver_id": "asdas",   
    // "traveler_id": "67e900c9-1240-4e4d-80d5-aa8f9e018934",
    // "personNumber": "string", 
    // "maxTimeWaiting": "15",
    // "travelPeferences": "" 
     

    const url = BASE_URL + id ; 

    return this.http.patch<any>(url, data).pipe(

      tap((data: any) => {

        console.log('Travel Request', data);
      }),


      catchError(this.handleError)
    );

  }


  // ----------------------------------
  // TODO: funcion para eliminar formulario de solicitud de viaje   
  // ----------------------------------
  cancelTravelRequest() {

    const url = BASE_URL + 'cancel';


  }



  // ----------------------------------
  // TODO: funcion para manejar errores
  // ----------------------------------
  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.log('Se ha producido un error ', error.error);
      this.dataService.showMsj('Ha ocurriddo un error, por favor intente más tarde.', 'Error.', 'danger');

    } else if (error.status === 400) {
      console.error('Error en la petición ' + error.status)

    } else if (error.status === 401) {

      console.error('Sin Autorización! ' + error.status);
      this.dataService.showMsj('Credenciales Incorrectas, por favor rectifique.', 'Error.', 'danger');

    } else if (error.status === 500) {

      console.error('Error en el Servidor ' + error.status);
      this.dataService.showMsj('Ha ocurriddo un error, por favor si es posible comuníquese con nosotros.', 'Error.', 'danger');

    }
    else {
    }
    return throwError(() => new Error(`${error.status}`));


  }

}
