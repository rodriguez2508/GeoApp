import { TripTravelerService } from './../../../../../services/trip/trip-traveler.service';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { I_UserSessionStorage } from '../../../../../interface/user.interface';
import { I_FormTravelRequest } from '../../../../../interface/trip.interface';
import { StorageService } from '../../../../../services/storage/storage.service';
import { PMapRouteComponent } from '../../shared/p-map-route/p-map-route.component';
import { Coordinate } from 'ol/coordinate';
import { DataService } from '../../../../../services/data/data.service';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { DataTravelerService } from '../../../../../services/data/data_traveler.service';
import { I_Offers } from '../../../../../interface/offers';
import { SocketioServices } from '../../../../../services/sockets/socketio.service';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-pending-page',
  standalone: true,
  imports: [PMapRouteComponent],
  templateUrl: './pending-page.component.html',
  styleUrl: './pending-page.component.scss'
})
export class PendingPageComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {


  private _snackBar = inject(MatSnackBar);

  title_page: string = '';


  // ---------------------------------------------------
  //TODO -- establece la data a los viajes  INICIO
  //  las funciones estan en el archivo data_traveler.service.ts
  // --------------------------------------------------- 
  travels$: I_FormTravelRequest = {
    id: '',
    origin_coordinate: '',
    destination_coordinate: '',
    destination_address: '',
    origin_address: '',
    status: '',
    driver_id: '',
    traveler_id: '',
    vehicleType: '',
    personNumber: '',
    maxTimeWaiting: '',
    travelPeferences: ''
  };

  // travelsSubject = new BehaviorSubject<I_FormTravelRequest>(this.travels$);

  // ---------------------------------------------------
  //TODO -- establece la data a los viajes  FINAL
  //  las funciones estan en el archivo data_traveler.service.ts
  // --------------------------------------------------- 


  // ---------------------------------------------------
  //TODO -- establece la data a las ofertas INICIO
  //  las funciones estan en el archivo data_traveler.service.ts
  // --------------------------------------------------- 
  offers$: I_Offers[] = [];

  // offersSubject = new BehaviorSubject<I_Offers[]>(this.offers$);

  // ---------------------------------------------------
  //TODO -- establece la data a las ofertas FINAL
  //  las funciones estan en el archivo data_traveler.service.ts
  // --------------------------------------------------- 


  // ---------------------------------------------------
  //TODO -- establece la data del usuario  INICIO 
  //  las funciones estan en el archivo data_traveler.service.ts
  // --------------------------------------------------- 
  userData$: I_UserSessionStorage = {
    id: '',
    ci: '',
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone: '',
    user_type: ''
  };

  // userDataSubject = new BehaviorSubject<I_UserSessionStorage>(this.userData$);
  // --------------------------------------------------
  //TODO -- establece la data del usuario  FINAL
  // ---------------------------------------------------


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
  time: { min: number, sec: number } = { min: -1, sec: 59 };


  // --------------------------------------------------- 
  // TODO estado del socket INICIO 
  // ---------------------------------------------------

  @Input() socket_status$: boolean = false;
  @Input() socket: any;
  // ---------------------------------------------------
  // TODO estado del socket FINAL
  // ---------------------------------------------------




  constructor(
    private socketioService: SocketioServices,
    private router: Router,
    private route: ActivatedRoute,
    private tripTravelerService: TripTravelerService,
    private storageService: StorageService,
    private dataService: DataService,
    private changeDetectorRef: ChangeDetectorRef,
    private dataTravelerService: DataTravelerService
  ) {

    this.route.queryParams.subscribe((params) => {

    });


  }
  ngOnDestroy(): void {

  }
  ngOnInit(): void {



    // -- Subscribirse al userData para obtener datos de sesion del usuario
    this.subscribeUserData();

    // -- Subscribirse al travelData para obtener viajes
    this.subscribeTravelData();


  }
  ngOnChanges(changes: SimpleChanges): void {

  }

  ngAfterViewInit(): void {


  }

  // TODO se subscribe a la funcion para obtener los datos del usuario
  // -----------------------------------------

  subscribeUserData() {

    this.dataService.getuserData().subscribe(data => {

      console.log('subscribeUserData', data)
      if (data !== undefined) {
        this.userData$ = data;
      }

    });



  }

  // TODO se subscribe a la funcion para obtener los viajes del usuario
  // -----------------------------------------
  subscribeTravelData() {

    this.getTravels(this.userData$.id);

    this.dataTravelerService.getTravelData().subscribe(async data => {

      console.log('subscribeTravelData', data)
      if (data !== undefined) {

        this.travels$ = data;

        // -- abrir conexion del socket para las ofertas 
        this.subscribeOffers();


        // -- Asignar valor de las coordenadas del viaje 
        // --
        this.coord = [parseFloat(data.origin_coordinate.split(',')[0]), parseFloat(data.origin_coordinate.split(',')[1])];

        this.coord_destination = [parseFloat(data.destination_coordinate.split(',')[0]), parseFloat(data.destination_coordinate.split(',')[1])];

        // -- |1| - comprueba que las coord sean validas
        // --

        if (this.checkCoordinates('origin') && this.checkCoordinates('destination'))
          this.showMap = true;

        // --
        // -- |1| - comprueba que las coord sean validas


        // -- |2| Comprobar expiracion del Viaje
        // --

        // -- asignar valor de viaje fue creado
        const dateCreated = new Date(data.date_created !== undefined && data.id !== '' ? data.date_created : '');
        const dateFinish = new Date(data.date_finish !== undefined && data.id !== '' ? data.date_finish : '');
        // -- asignar valor de campo tiempo de espera
        this.time.min = parseInt(data.maxTimeWaiting);


        // -- comprobar que el viaje este vencido
        if (data.id !== undefined && data.id !== '')
          if (this.checkTravelExpiration(dateCreated, dateFinish, this.time.min)) {

            // TODO  volver a publicar el viaje?
            await this.republishTravel(parseInt(data.maxTimeWaiting), data.id);

          } else {
            this.setTimer(parseInt(data.maxTimeWaiting), data.id);
          }
        // -- |2| Comprobar expiracion del Viaje

      }

    });



  }
  // ---------------------------------------------------
  //TODO -- Obtiene los viajes con estado 'pending' del usuario
  // ---------------------------------------------------
  getTravels(user_id: string) {

    console.log('entro en getTravels')

    // StatusTravel :
    // --> 1 Pendiente
    // --> 2 En curso
    // --> 3 Completado
    this.tripTravelerService.getTravels(user_id, 'pending').pipe(
      take(1)
    ).subscribe(

      data => {
        console.log('entro en getTravelsService', data);

        if (data.length !== 0) {
          this.dataTravelerService.setTravelData(data[0]);

        }
      }

    );



  }

  // ---------------------------------------------------
  //TODO -- Establecer el temporizador
  // ---------------------------------------------------

  setTimer(minutesExp: number, travelId: string) {


    if (travelId != undefined && travelId != '') {
      this.interval = setInterval(() => {


        if (this.time.sec === 0) {
          if (this.time.min === 0) {

            this.time.min = -1;
            this.time.sec = 0;
            this.stopInterval();

            // llamar a la funcion para volver a publicar el viaje
            this.republishTravel(minutesExp, travelId);

          } else {

            this.time.sec = 59;
            this.time.min--;
          }
        } else {
          this.time.sec--;
        }
      }, 1000);
    }


  }


  async republishTravel(minutesExp: number, travelId: string) {

    if (travelId != undefined && travelId != '') {
      const shouldRepublish = await this.dataService.showQuestion(
        'Su viaje ha expirado, desea volver a publicarlo?',
        '',
        'warning'
      );

      if (shouldRepublish) {

        this.time.sec = 59;
        this.time.min = minutesExp;
        this.updateDateFinish(minutesExp, travelId);

      } else {

        this.time.sec = 59;
        this.time.min = -1;
        this.dataTravelerService.setTravelData(null);
        this.updateTravelStatus('expired', travelId);

      }
    }
  }

  // ---------------------------------------------------
  //TODO -- Actualizar tiempo de expirado del viaje con estado 'pending' 
  // ---------------------------------------------------
  updateDateFinish(minutesExp: number, id: string) {

    // Verificar conexion al servidor
    if (!this.socket_status$) {
      this.dataService.showMsj('Por favor, intente en un rato..', 'Sin Conexión!', 'error');

      return;
    }

    const travelData = {
      maxTimeWaiting: minutesExp
    };

    this.tripTravelerService.updateTravelDateFinish(travelData, id).pipe(
      take(1)
    ).subscribe(

      data => {
        console.log('entro en updateTravels', data);

        const config = this.dataService.openSnackBar('success', 3);
        const snackBarRef = this._snackBar.open('Solicitud realizada con éxito', 'CLOSE', config);
        snackBarRef.afterDismissed().subscribe(() => {

          this.changeDetectorRef.detectChanges();

          this.reloadComponent(true);

        });


      }

    );

  }

  // ---------------------------------------------------
  //TODO -- Actualizar estado del viaje con estado 'pending' del usuario a 'expired'
  // ---------------------------------------------------
  updateTravelStatus(status: string, id: string) {

    // Verificar conexion al servidor
    if (!this.socket_status$) {
      this.dataService.showMsj('Por favor, intente en un rato..', 'Sin Conexión!', 'error');

      return;
    }
    const travelData = {
      status: status
    };

    this.tripTravelerService.updateTravelRequest(travelData, id).pipe(
      take(1)
    ).subscribe(

      data => {
        console.log('entro en updateTravels', data);

        const config = this.dataService.openSnackBar('success', 3);
        const snackBarRef = this._snackBar.open('Solicitud realizada con éxito', 'CLOSE', config);

        snackBarRef.afterDismissed().subscribe(() => {
          this.changeDetectorRef.detectChanges();

          this.reloadComponent(true);
          // window.location.reload();

        });
      }

    );

  }



  // ---------------------------------------------------
  //TODO -- Cancelar viaje con estado 'pending' 
  // ---------------------------------------------------

  async cancelTravel(travelId: string) {

    // Verificar conexion al servidor
    if (!this.socket_status$) {
      this.dataService.showMsj('Por favor, intente en un rato..', 'Sin Conexión!', 'error');

      return;
    }

    if (travelId !== undefined)
      if (await this.dataService.showQuestion('Está seguro que desea cancelar el viaje?', '', 'warning')) {

        // TODO cambiar estado del viaje a expired
        // --
        // this.setTravelData(null);
        this.dataTravelerService.setTravelData(null);

        this.stopInterval();
        this.time.min = -1;
        this.time.sec = 0;

        this.updateTravelStatus('canceled', travelId);

      }

  }

  // ---------------------------------------------------
  //TODO -- Cancelar viaje con estado 'pending' 
  // ---------------------------------------------------

  deleteTravel(travelId: string) {


    return this.tripTravelerService.deleteTravelRequest(travelId).pipe(
      take(1)
    ).subscribe({
      next: (data: any) => {

        console.log('DELETE TRAVEL PENDING PAGE => ', data)
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
  // TODO -- Detener el temporizador
  // -- 
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
  checkTravelExpiration(date: Date | undefined, date_finish: Date | undefined, minutesExp: number): boolean {

    if (date === undefined || date_finish === undefined) return true;

    // Calcula la diferencia en minutos entre la fecha actual y la fecha de finalización

    const time = Math.floor((date_finish.getTime() - date.getTime())) / 60000;
    const dateToday = new Date().getTime();
    const dateExpired = date_finish.getTime();

    if (dateToday < dateExpired) {
      this.time.min = Math.floor((dateExpired - dateToday) / 60000);
      return false;
    } else {
      this.time.min = -1;
      return true;
    }


  }

  // TODO ---------------------------------------
  // -- recarga el componente o redirige a otra ruta
  // 
  reloadComponent(self: boolean, urlToNavegateTo?: string) {

    //
    console.log('Ruta actual', this.router.url);
    const url = self ? this.router.url : urlToNavegateTo;

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {

      this.router.navigate([`/${url}`]).then(() => {

        console.log('Ruta despues de la navegacion', this.router.url);

      });
    });


  }


  // ---------------------------------------------------
  // TODO -- Obtener OFERTAS
  // ---------------------------------------------------

  getOffers() {
    if (this.socket != undefined || this.socket != null)
      this.socket.on('listen-offers', (data: I_Offers) => {
        this.offers$.push(data); // Agrega la oferta recibida al arreglo de ofertas
      });

  }
  // ---------------------------------------------------
  // TODO -- Obtener OFERTAS
  // ---------------------------------------------------

  // ---------------------------------------------------
  // TODO -- SOCKETS
  // ---------------------------------------------------

  // subscribeSocketStatus() {

  //   this.dataTravelerService.getSocketStatus().subscribe(data => {

  //     console.log('subscribeSocketStatus', data)
  //     if (data !== undefined) {
  //       this.socket_status$ = data;
  //     }

  //   });



  // } 

  // --para escuchar el evento 'listen-offers':

  subscribeOffers() {


    if (!this.travels$ || this.travels$.id === '') {
      return;
    }

    this.getOffers();

    this.dataTravelerService.getOffers().subscribe(data => {

      console.log('subscribeOffers', data)
      if (data !== undefined && data.length != 0) {
        this.offers$ = data;
      }

    });

  }

  // ---------------------------------------------------
  // TODO -- SOCKETS
  // ---------------------------------------------------



}
