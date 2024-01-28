import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { BehaviorSubject, Observable } from 'rxjs';
 


@Injectable({
  providedIn: 'root'
})
export class GeolocService {

  watchId: number | null = null; 
  private max_count = new BehaviorSubject<number>(0);
  count:number= 0;
  constructor(private dataService: DataService ) { }
  
  startWatchingPosition(callback: (position: GeolocationPosition) => void): void {
    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (position: GeolocationPosition) => {
          this.set_max_count(0)  
          
          callback(position);
        },
        (error: GeolocationPositionError) => {
          console.error('Error getting location:', error.message);
         
          this.count++;
          this.set_max_count(this.count); 

          if (this.count >= 15) {

            this.set_max_count(-1) 

            this.stopWatchingPosition();

          }
          
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    } else {
      console.error('Geolocation is not supported.');
    }
  }

  stopWatchingPosition(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // -----------------------------------




  // -----------------------------------
  public get_max_count(): Observable<number> {

    return this.max_count.asObservable();
  }

  public set_max_count(value: number) {

    this.max_count.next(value);
  }

  // -------------------------------------
  
  // -------------------------------------
   

}
