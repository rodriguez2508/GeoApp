import { DataTravelerService } from './../data/data_traveler.service';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../data/data.service';
import { StorageService } from '../storage/storage.service';
import { I_FormTravelRequest } from '../../interface/trip.interface';
import { Observable, catchError, finalize, map, switchMap, take, tap, throwError } from 'rxjs';


const BASE_URL = environment.TRIP_API;



@Injectable({
  providedIn: 'root'
})

export class TripTravelerService {

  constructor(
    private http: HttpClient,
    private dataService: DataService,
    private dataTravelerService: DataTravelerService,
  ) { }



  // ----------------------------------
  // TODO: funcion para guardar formulario de solicitud de viaje   
  // ----------------------------------
  saveTravelRequest(dataForm: any, user_id: string): Observable<any> {

    console.log('saveTravelRequest', dataForm)
    const travelData: I_FormTravelRequest = {
      origin_coordinate: dataForm.placeOrigin,
      destination_coordinate: dataForm.placeDestination,
      origin_address: dataForm.origin_address,
      destination_address: dataForm.destination_address,
      status: 'pending',
      traveler_id: user_id,
      driver_id: '',
      personNumber: dataForm.personNumber,
      maxTimeWaiting: dataForm.maxTimeWaiting,
      travelPeferences: dataForm.travelPeferences
    };


    const url = BASE_URL;

    return this.http.post<any>(url, travelData).pipe(
      switchMap(() => this.getTravels(user_id, 'pending')),
      tap(data => data || []),
      catchError(this.handleError)
    );


  }
  // ----------------------------------
  // TODO: funcion para obtener Viajes realizados   
  // ----------------------------------
  getTravels(user_id: string, status: string = 'all'): Observable<any> {
    const url = `${BASE_URL}by_traveler/${user_id}/${status}`;

    return this.http.get<any>(url).pipe(
      map(data => data || []), // Transforma la respuesta en un array vacío si no hay datos
      catchError(this.handleError),
      finalize(() => {
        console.log('Petición completada');
      })
    );
  }
  // ----------------------------------
  // TODO: funcion para actualizar estado de viaje   
  // ----------------------------------
  updateTravelRequest(data: any, id: string): Observable<any> {
    const url = `${BASE_URL}${id}`;

    return this.http.patch<any>(url, data).pipe(
      map(data => data || []), // Transforma la respuesta en un array vacío si no hay datos
      catchError(this.handleError),
      finalize(() => {
        console.log('Petición completada');
      })
    );
  }
  // ----------------------------------
  // TODO: funcion para actualizar fecha de expiracion de viaje   
  // ----------------------------------
  updateTravelDateFinish(data: any, id: string): Observable<any> {

    const url = BASE_URL + 'time_finish/' + id;

    return this.http.patch<any>(url, data).pipe(
      map(data => data || []), // Transforma la respuesta en un array vacío si no hay datos

      catchError((error: HttpErrorResponse) => {
        console.error(error);
        const errorMessage = error.message || 'Error updating travels';
        return throwError(() => errorMessage);
      }),
      finalize(() => {
        console.log('Petición completada');
      })
    );

  }


  // ----------------------------------
  // TODO: funcion para eliminar formulario de solicitud de viaje   
  // ----------------------------------
  deleteTravelRequest(id: string): Observable<any> {

    const url = BASE_URL + id;

    return this.http.delete<any>(url).pipe(

      tap((data: any) => {

        console.log('Travel Request', data);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        const errorMessage = error.message || 'Error deleting travels';
        return throwError(() => errorMessage);
      }),
    );
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
