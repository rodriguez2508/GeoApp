
import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import * as ors from 'openrouteservice';

@Injectable({
  providedIn: 'root'
})
export class OpenRouteService {

  // private apiKey = environment.api_GraphHopper;
  //  -9081059.226249881, 2636147.411602837
  // private apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248694920327f1c4d81ad3c9c7231c5a802&start=8.681495,49.41461&end=8.687872,49.420318';
  private apiKey = environment.api_ors;
  // private 

  constructor(private http: HttpClient) { }

  getRoute(start: number[], end: number[]): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const apiUrl = 'https://api.openrouteservice.org/v2/directions/driving-car?api_key=' + this.apiKey + '&start=' + start[0] + ',' + start[1] + '&end=' + end[0] + ',' + end[1];

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('start', `${start[1]},${start[0]}`)
      .set('end', `${end[1]},${end[0]}`);

    return this.http.get(apiUrl);
  }
}
