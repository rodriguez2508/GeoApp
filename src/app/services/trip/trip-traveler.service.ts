import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { DataService } from '../data/data.service';
import { StorageService } from '../storage/storage.service';
import { I_FormTravelRequest } from '../../interface/trip.interface';
import { Observable, catchError, tap, throwError } from 'rxjs';


const TRIP_API = environment.TRIP_API;



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
  saveTravelRequest(dataForm:I_FormTravelRequest): Observable<any>{

    const url = TRIP_API + 'save';
    console.log('Travel Request', dataForm);
    const tripData:I_FormTravelRequest = dataForm;

    return this.http.post<any>(url, tripData).pipe(

      tap((data: any) => {
        
        console.log('Travel Request', data);
      }),


      catchError(this.handleError)
    );


  }

  // ----------------------------------
  // TODO: funcion para actualizar formulario de solicitud de viaje   
  // ----------------------------------
  updateTravelRequest(){
    
    const url = TRIP_API + 'update';


  }


  // ----------------------------------
  // TODO: funcion para eliminar formulario de solicitud de viaje   
  // ----------------------------------
  cancelTravelRequest(){

    const url = TRIP_API + 'cancel';

    
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
 
      console.error('Sin Autorización! ' + error.status) ;
      this.dataService.showMsj('Credenciales Incorrectas, por favor rectifique.', 'Error.', 'danger');

    } else if (error.status === 500) {
 
      console.error('Error en el Servidor ' + error.status) ;
      this.dataService.showMsj('Ha ocurriddo un error, por favor si es posible comuníquese con nosotros.', 'Error.', 'danger');

    }
    else{
    }
    return throwError(() => new Error(`${error.status}`));

    
  }

}
