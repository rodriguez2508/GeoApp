import { Injectable } from '@angular/core'; 
import { BehaviorSubject, Observable, Observer } from 'rxjs';
 


@Injectable({
  providedIn: 'root'
})
export class GeolocService {

  watchId: number | null = null; 
  public locationStatus = new BehaviorSubject<boolean>(false);
  private max_count = new BehaviorSubject<number>(0); 
  private count=0;
  constructor( ) { }
  
  startWatchingPosition(callback: (position: GeolocationPosition) => void): void {
    if ('geolocation' in navigator) {

      const options = {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000
      };
  
      this.watchId = navigator.geolocation.watchPosition(
        position => {
          this.locationStatus.next(true);
          this.max_count.next(0);
          callback(position);
        },
        error => {
          console.error(`Error getting location: ${error.message}`);
          this.count++;
          this.locationStatus.next(false);
          this.max_count.next(this.count);
          console.log('max_count', this.count)
          if (this.count >= 5) {
            this.max_count.next(-1);
            this.stopWatchingPosition();
          }
        },
        options
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
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
  public get_locationStatus(): Observable<boolean> {

    return this.locationStatus.asObservable();
  }
  public get_maxcountStatus(): Observable<number> {

    return this.max_count.asObservable();
  }

  // -------------------------------------
  
  // -------------------------------------
   

}
