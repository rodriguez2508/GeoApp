import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DataService } from '../data/data.service';
import { StorageService } from '../storage/storage.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { I_Places, I_Places_db } from '../../interface/places.interface';


const BASE_URL = environment.FAVORITES_PLACES_API;


@Injectable({
  providedIn: 'root'
})
export class FavoritesPlacesService {



  constructor(
    private http: HttpClient,
    private dataService: DataService,
    private router: Router,
    private storageService: StorageService
  ) { }



  // ----------------------------------
  // TODO: funcion para guardar formulario de solicitud de viaje   
  // ----------------------------------
  savePlace(dataForm: I_Places): Observable<any> {

    const url = `${BASE_URL}` ;
 
    const user_id: string = this.storageService.getUser().id;
 
    const placeData: I_Places_db = {
      user_id: user_id,
      coordinates: dataForm.coordinates,
      name: dataForm.name,
      address: dataForm.address
    };

    console.log('Favorite Places save', placeData); 
    return this.http.post<any>(url, placeData).pipe(

      tap((data: any) => {

        console.log('Favorite Places', data);

      }),


      catchError(this.handleError)
    );


  }

  // ----------------------------------
  // TODO: funcion para actualizar formulario de solicitud de viaje   
  // ----------------------------------
  updatePlace(id:string, place:I_Places): Observable<I_Places_db> {

    const user_id: string = this.storageService.getUser().id;

    const placeData: I_Places_db = {
      user_id: user_id,
      coordinates: place.coordinates,
      address: place.address,
      name: place.name
    };

    // const token = this.storageService.f_getToken();

    const url = `${BASE_URL}/update?place_id=${id}`;

    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + token, // Ejemplo de encabezado de autorización si es necesario
    //   'Content-Type': 'application/json' // Ejemplo de encabezado de tipo de contenido si es necesario
    // });

    return this.http.put<I_Places_db>(url, place).pipe(
      tap((data: any) => {
        // Realizar acciones con los datos si es necesario
      }),
      
    );
  }


  // ----------------------------------
  // TODO: funcion para eliminar formulario de solicitud de viaje   
  // ----------------------------------
  deletePlace(id:string): Observable<I_Places_db> {

    // const token = this.storageService.f_getToken();

    const url = `${BASE_URL}/place_id=${id}`;

    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + token, // Ejemplo de encabezado de autorización si es necesario
    //   'Content-Type': 'application/json' // Ejemplo de encabezado de tipo de contenido si es necesario
    // });

    return this.http.delete<I_Places_db>(url).pipe(
      tap((data: any) => {
        // Realizar acciones con los datos si es necesario
      }),
      
    );
  }

  
   // ----------------------------------
  // TODO: funcion para obtener Lugares   
  // ----------------------------------
  getPlaceByUser(user_id:string): Observable<any> { 

    // const token = this.storageService.f_getToken();

    // const headers = new HttpHeaders({
    //   'Authorization': 'Bearer ' + token, // Ejemplo de encabezado de autorización si es necesario
    //   'Content-Type': 'application/json' // Ejemplo de encabezado de tipo de contenido si es necesario
    // });
    

    const url = `${BASE_URL}by_user/${user_id}`;

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
