import { TripTravelerService } from './../../../../../services/trip/trip-traveler.service';
import { AfterViewInit, Component, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { I_UserSessionStorage } from '../../../../../interface/user.interface';
import { I_FormTravelRequest } from '../../../../../interface/trip.interface';
import { StorageService } from '../../../../../services/storage/storage.service';
import { PMapRouteComponent } from '../../shared/p-map-route/p-map-route.component';
import { Coordinate } from 'ol/coordinate';
import { DataService } from '../../../../../services/data/data.service';

@Component({
  selector: 'app-pending-page',
  standalone: true,
  imports: [PMapRouteComponent],
  templateUrl: './pending-page.component.html',
  styleUrl: './pending-page.component.scss'
})
export class PendingPageComponent implements OnChanges, AfterViewInit {


  private _snackBar = inject(MatSnackBar);

  title_page: string = 'Lugares Favoritos';
  travels: I_FormTravelRequest[] = [];
  userData: I_UserSessionStorage = {
    id: '',
    ci: '',
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone: '',
    user_type: ''
  };

  // -- para mostrar el mapa con la ruta si existen las 2 coordenadas (origen y destino )
  showMap = false;
  // --coordenadas de la posicion actual del usuario
  coord: Coordinate = [];
  // --lugar de la posicion actual del usuario
  address_coord: string = '';
  // --coordenadas de la posicion destino del usuario
  coord_destination: Coordinate = [];
  // --lugar de la posicion destino del usuario
  address_coord_destination: string = '';

  interval: any;
  time: { min: number, sec: number } = { min: 0, sec: 0 };


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tripTravelerService: TripTravelerService,
    private storageService: StorageService,
    private dataService: DataService
  ) {

    this.route.queryParams.subscribe((params) => {

    });



  }
  ngOnChanges(changes: SimpleChanges): void {

  }
  ngAfterViewInit(): void {

    this.userData = this.storageService.getUser();

    this.getTravels(this.userData.id);

    // --
    // -- Para el Temporizador del viaje
    // -- 
    this.time.sec = 59;
    console.log(this.time.min)
    this.interval = setInterval(async () => {

      if (this.time.sec === 0) {

        if (this.time.min === 0) {


          if (await this.dataService.showQuestion('Su viaje ha expirado, desea volver a publicarlo?', '', 'warning')) {
            this.time.min = parseInt(this.travels[0].maxTimeWaiting);
          } else {

            this.stopInterval();
            // --
            // TODO cambiar estado del viaje a expired
            // --
            if (this.travels[0].id !== undefined)
              this.updateTravelStatus('expired', this.travels[0].id);


          }

        } else {

          // -- si los minutos != 0 y los sec = 0 resto 1 min sec = 59
          this.time.sec = 59;
          this.time.min--;

        }
      } else {
        // -- si los segundos no son 0 resto 1
        this.time.sec--;
      }

    }, 1000);
  }



  // ---------------------------------------------------
  //TODO -- Obtiene los viajes con estado 'pending' del usuario
  // ---------------------------------------------------
  getTravels(user_id: string) {


    // StatusTravel :
    // --> 1 Pendiente
    // --> 2 En curso
    // --> 3 Completado
    this.tripTravelerService.getTravels(user_id, 'pending').subscribe(
      {
        next: (data) => {

          if (data && data.length != 0) {

            for (let i = 0; i < data.length; i++) {
              this.travels[i] = {
                id: data[i].id,
                origin_coordinate: data[i].origin_coordinate,
                destination_coordinate: data[i].destination_coordinate,
                destination_address: data[i].destination_address,
                origin_address: data[i].origin_address,
                status: data[i].status,
                driver_id: data[i].driver_id,
                traveler_id: data[i].traveler_id,
                vehicleType: data[i].vehicleType,
                personNumber: data[i].personNumber,
                maxTimeWaiting: data[i].maxTimeWaiting,
                travelPeferences: data[i].travelPeferences,
                dateCreated: data[i].date_created
              };
            }

            // -- Asignar valor de las coordenadas del viaje 
            // --
            this.coord = [parseFloat(this.travels[0].origin_coordinate.split(',')[0]), parseFloat(this.travels[0].origin_coordinate.split(',')[1])];

            this.coord_destination = [parseFloat(this.travels[0].destination_coordinate.split(',')[0]), parseFloat(this.travels[0].destination_coordinate.split(',')[1])];


            if (this.checkCoordinates('origin') && this.checkCoordinates('destination'))
              this.showMap = true;


            const dateCreated = new Date(this.travels[0].dateCreated !== undefined ? this.travels[0].dateCreated : '');
            // -- obtener el campo tiempo de espera
            this.time.min = parseInt(this.travels[0].maxTimeWaiting);
            // -- comprobar que el viaje este vencido
            if (this.checkTravelExpiration(dateCreated, this.time.min)) {

              // TODO  cambiar estado del viaje a expired
              if (this.travels[0].id !== undefined)
                this.updateTravelStatus('expired', this.travels[0].id);
            }
          }

          // console.log(this.travels)

        },
        error: (error) => {
          console.log(error)
        }
      }

    );

  }

  // ---------------------------------------------------
  //TODO -- Actualizar estado del viaje con estado 'pending' del usuario a 'expired'
  // ---------------------------------------------------

  updateTravelStatus(status: string, id: string) {



    const travelData = {
      status: status
    };

    this.tripTravelerService.updateTravelRequest(travelData, id).subscribe({
      next: (data: any) => {

        console.log('UPDATE STATUS TRAVEL PENDING PAGE => ', data)
        // this.goToTravelHistory();
        // const config = this.dataService.openSnackBar('success');
        // this._snackBar.open('Solicitud realizada con éxito', 'CLOSE', config);

      },
      error: (errorData) => {

        console.log(errorData)

        // const config = this.dataService.openSnackBar('danger');
        // this._snackBar.open('Ha ocurrido un error en la solicitud', 'CLOSE', config);

      },
      complete: () => {

      },
    });

  }

  // TODO ---------------------------------------
  // -- Detener el temporizador
  // 
  stopInterval() {

    clearInterval(this.interval);

  }

  // TODO ---------------------------------------
  // -- comprueba que las coordenadas esten en formato correcto
  // 
  checkCoordinates(type: string): boolean {

    //  -- si el tipo de coord es origen 
    if (type === 'origin')
      if (this.coord && this.coord[0] != 0 && this.coord[1] != 0 && this.coord[0] !== undefined && this.coord[1] != undefined) return true;

    //  -- si el tipo de coord es destino 
    if (type === 'destination')
      if (this.coord_destination && this.coord_destination[0] != 0 && this.coord_destination[1] != 0 && this.coord_destination[0] !== undefined && this.coord_destination[1] != undefined) return true;

    return false;

  }
  // TODO ---------------------------------------
  // -- comprueba que el viaje no este vencido o expirado
  // 
  checkTravelExpiration(date: Date | undefined, minutesExp: number): boolean {

    if (date === undefined) return false;

    const dateExpired = date.getTime() + minutesExp * 60000;

    const dateToday = new Date().getTime();

    console.log('dateExpired ->',dateExpired )
    console.log('dateToday ->',dateToday )
    if (dateToday < dateExpired)
      this.time.min = Math.floor( (dateExpired - dateToday) / 60000);
    // else
    //   this.time.min = 0;

    return dateToday > dateExpired;

  }

}
