
import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import * as ors from 'openrouteservice';

import { Coordinate } from 'ol/coordinate';


// Crea una instancia de la clase Openrouteservice con tu clave de API
const ORS = new ors.default(environment.api_ors);

@Injectable({
  providedIn: 'root'
})
export class OpenRouteService {


  // private apiKey = environment.api_GraphHopper;
  //  -9081059.226249881, 2636147.411602837
  // private apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248694920327f1c4d81ad3c9c7231c5a802&start=8.681495,49.41461&end=8.687872,49.420318';
  private apiKey = environment.api_ors; 
  private apiUrl = 'https://api.openrouteservice.org';

  

  // private 

  constructor(private http: HttpClient) { }

  getRoute(start: number[], end: number[]): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

     
    const apiUrl = this.apiUrl + '/v2/directions/driving-car?api_key=' + this.apiKey + '&start=' + start[0] + ',' + start[1] + '&end=' + end[0] + ',' + end[1]+'&instructions=true';

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('start', `${start[1]},${start[0]}`)
      .set('end', `${end[1]},${end[0]}`);

    return this.http.get(apiUrl);
  }

  getStreetInformation(coord:Coordinate){

    // const url = 'https://api.openrouteservice.org/geocode/reverse?' + queryParams.toString();
    const url = 'https://api.openrouteservice.org/geocode/reverse?api_key=5b3ce3597851110001cf6248694920327f1c4d81ad3c9c7231c5a802&point.lon=2.294471&point.lat=48.858268';
    

    const apiUrl = this.apiUrl + '/geocode/reverse?api_key=' + this.apiKey + '&point.lon=' + coord[0] + '&point.lat=' + coord[1];

    const query = coord[1]+ ',' + coord[0]; // Reemplaza LATITUD y LONGITUD con las coordenadas del punto que deseas obtener la dirección


    // return this.http.get(apiUrl, { headers, params });
 
    return this.http.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord[1]}&lon=${coord[0]}`);
    // return this.http.get(apiUrl);

  }
}
