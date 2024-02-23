import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Observer } from 'rxjs';

import Geolocation from 'ol/Geolocation';

@Injectable({
  providedIn: 'root'
})
export class GeolocService {

  // watchId: number | null = null;
  public locationStatus = new BehaviorSubject<boolean>(false);
  private max_count = new BehaviorSubject<number>(0);
  // private count = 0;

  constructor(private zone: NgZone) {
    // Inicializar el objeto Geolocation
    this.geolocation = new Geolocation();
  }

  // startWatchingPosition(callback: (position: GeolocationPosition) => void): void {

  //   try {
  //     if ('geolocation' in navigator) {

  //       const options = {
  //         enableHighAccuracy: true,
  //         timeout: 10000,
  //         maximumAge: 5000
  //       };

  //       this.watchId = navigator.geolocation.watchPosition(
  //         position => {
  //           this.locationStatus.next(true);
  //           this.max_count.next(0);
  //           callback(position);
  //         },
  //         error => {
  //           console.error(`Error getting location: ${error.message}`);
  //           this.count++;
  //           this.locationStatus.next(false);
  //           this.max_count.next(this.count);
  //           console.log('max_count', this.count)
  //           if (this.count >= 10) {
  //             this.count = 1;
  //             this.max_count.next(-1);
  //             this.stopWatchingPosition();
  //           }
  //         },
  //         options
  //       );
  //     } else {
  //       console.error('Geolocation is not supported by this browser.');

  //       this.max_count.next(-1);
  //     }
  //   } catch (e: any) {
  //     console.error(e.message);
  //     this.max_count.next(-2);

  //   }
  // }

  // stopWatchingPosition(): void {
  //   if (this.watchId !== null) {
  //     navigator.geolocation.clearWatch(this.watchId);
  //     this.watchId = null;
  //   }
  // }

  // // -----------------------------------


  // getUserLocation(callback: (position: any) => void ) {
  //   const geolocation = new Geolocation({
  //     trackingOptions: {
  //       enableHighAccuracy: true,
  //       timeout: 10000,
  //       maximumAge: 5000
  //     },

  //   });

  //   // Obtener la posición actual
  //   geolocation.once('change', () => {
  //     const coordinates = geolocation.getPosition();
  //     if (coordinates) {
  //       this.locationStatus.next(true);
  //           this.max_count.next(0);
  //           callback(coordinates);
  //     }
  //   });

  //   // Manejar el evento de error
  //   geolocation.on('error', (error) => {

  //     this.locationStatus.next(false);

  //     switch (error.code) {
  //       case 1:
  //         console.error('La geolocalización está desactivada.');
  //         this.max_count.next(-1);
  //         break;
  //       case 2:
  //         console.error('No se puede obtener la ubicación.');
  //         this.max_count.next(-2);
  //         break;
  //       case 3:
  //         console.error('Tiempo de espera para obtener la ubicación agotado.');
  //         this.max_count.next(-3);
  //         break;
  //       default:
  //         console.error('Error de geolocalización:', error.message);
  //         this.max_count.next(-4);
  //         break;
  //     }
  //   });

  //   // Activar la geolocalización
  //   geolocation.setTracking(true);
  // }

  private geolocation: Geolocation;
  private isWatching: boolean = false;

  // BehaviorSubject para emitir cambios en la posición
  private currentPositionSubject = new BehaviorSubject<GeolocationPosition | null>(null);
  currentPosition$ = this.currentPositionSubject.asObservable();


  startWatchingPosition(callback: (position: any) => void): void {



    try {
      if (!this.isWatching) {
        this.isWatching = true;

        // Inicializar el objeto Geolocation
        this.geolocation = new Geolocation({
          trackingOptions: {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 0
          },

        });

        // Escuchar cambios en la posición y emitirlos a través de BehaviorSubject
        this.geolocation.on('change', () => {
          const coordinates = this.geolocation.
          getPosition();

          this.watchGPS();

          if (coordinates) {

            this.zone.run(() => {
              this.locationStatus.next(true);
              this.max_count.next(0);
              callback(coordinates);

              // this.currentPositionSubject.next(this.geolocation.getPosition());
            });
          }
        });

        // Escuchar errores y emitirlos a través de BehaviorSubject
        this.geolocation.on('error', (error) => {
          this.zone.run(() => {


            console.error(`Error getting location: ${error.message}`);

            this.locationStatus.next(false);

            switch (error.code) {
              case 1:
                console.error('La geolocalización está desactivada.');
                this.max_count.next(-1);
                break;
              case 2:
                console.error('No se puede obtener la ubicación.');
                this.max_count.next(-2);
                break;
              case 3:
                console.error('Tiempo de espera para obtener la ubicación agotado.');
                this.max_count.next(-3);
                break;
              default:
                console.error('Error de geolocalización:', error.message);
                this.max_count.next(-4);
                break;
            }

          });
        });

        // Iniciar la observación de la posición
        this.geolocation.setTracking(true);
      }
    } catch (e: any) {
      console.error(e.message);
      // Manejar errores según tus necesidades
    }
  }

  stopWatchingPosition(): void {
    if (this.isWatching) {
      // Detener la observación de la posición
      this.geolocation.setTracking(false);
      this.locationStatus.next(false);
      this.max_count.next(-4);
      this.isWatching = false;
    }
  }

  watchGPS() {

    if (navigator.geolocation) {

      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'granted' || result.state === 'prompt') {



        } else {
          console.error('La geolocalización está desactivada.');
          this.stopWatchingPosition()
        }
      });

    }

  }


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
