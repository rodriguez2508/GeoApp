import { TripTravelerService } from './../../../../../services/trip/trip-traveler.service';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { Coordinate } from 'ol/coordinate';
import { BehaviorSubject, Observable, Subscription, catchError, finalize, map, switchMap, take, tap } from 'rxjs';

import { PMapRouteComponent } from '../../shared/p-map-route/p-map-route.component';

import { I_Offers } from '../../../../../interface/offers.interface';
import { I_UserSessionStorage } from '../../../../../interface/user.interface';
import { I_FormTravelRequest } from '../../../../../interface/trip.interface';

import { StorageService } from '../../../../../services/storage/storage.service';
import { DataService } from '../../../../../services/data/data.service';
import { DataTravelerService } from '../../../../../services/data/data_traveler.service';
import { SocketioServices } from '../../../../../services/sockets/socketio.service';
import { environment } from '../../../../../../environments/environment';


@Component({
  selector: 'app-pending-page',
  standalone: true,
  imports: [PMapRouteComponent, MatExpansionModule],
  templateUrl: './pending-page.component.html',
  styleUrl: './pending-page.component.scss'
})
export class PendingPageComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {


  private _snackBar = inject(MatSnackBar);

  title_page: string = '';
  panelOpenState = false;

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
  private subTravels$: any;
  private subTravels: any;
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
  private subOffers: any;
  private subOffersSocket: any;

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
  private subUserData: any;
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
  socket_offer: any;
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

    if (this.subTravels$) this.subTravels$.unsubscribe();
    if (this.subTravels) this.subTravels.unsubscribe();
    if (this.subOffers) this.subOffers.unsubscribe();
    if (this.subOffersSocket) this.subOffersSocket.unsubscribe();
    if (this.subUserData) this.subUserData.unsubscribe();
    if (this.interval) this.stopInterval();
  }
  ngOnInit(): void {

    this.changeDetectorRef.detectChanges();

    // -- Subscribirse al userData para obtener datos de sesion del usuario
    if (this.userData$.id == '')
      this.subscribeUserData();
 

     // if (this.userData$.id != '' && this.socket_status$ == true)
      this.getTravels(this.userData$.id);


  }
  ngOnChanges(changes: SimpleChanges): void {


  }

  ngAfterViewInit(): void {
 
    this.subscribeTravelData();
  }

  // TODO se subscribe a la funcion para obtener los datos del usuario
  // -----------------------------------------

  subscribeUserData() {

    this.subUserData = this.dataService.getuserData().pipe(
      tap(
        data => {

          // console.log('subscribeUserData', data)
          if (data !== undefined) {
            this.userData$ = data;
          }
        }
      )
    ).subscribe();



  }

  // TODO se subscribe a la funcion para obtener los viajes del usuario
  // -----------------------------------------
  subscribeTravelData() {

    this.subTravels$ = this.dataTravelerService.getTravelData().pipe(
      tap(
        async data => {

          // console.log('subscribeTravelData', data)

          this.travels$ = data;

          if (data.id !== undefined && data.id !== '') {

            // -- |1| Comprobar expiracion del Viaje
            // --

            // -- asignar valor de viaje fue creado
            const dateCreated = new Date(data.date_created !== undefined && data.id !== '' ? data.date_created : '');
            const dateFinish = new Date(data.date_finish !== undefined && data.id !== '' ? data.date_finish : '');
            // -- asignar valor de campo tiempo de espera
            this.time.min = parseInt(data.maxTimeWaiting);

            console.log('dateCreated', dateCreated)
            console.log('dateFinish', dateFinish)

            const travelExpirated = this.checkTravelExpiration(dateCreated, dateFinish, this.time.min);

            console.log('se actualizo el TIME => ', this.time.min)
            if (!this.interval || this.interval == null)
              this.setTimer(parseInt(data.maxTimeWaiting), data.id);

            if (!travelExpirated) {

              this.travels$ = data;
              // -- Asignar valor de las coordenadas7y del viaje 
              // --
              this.coord = [parseFloat(data.origin_coordinate.split(',')[0]), parseFloat(data.origin_coordinate.split(',')[1])];

              this.coord_destination = [parseFloat(data.destination_coordinate.split(',')[0]), parseFloat(data.destination_coordinate.split(',')[1])];

              // -- |3| - comprueba que las coord sean validas
              // --

              if (this.checkCoordinates('origin') && this.checkCoordinates('destination'))
                this.showMap = true;

              // --
              // -- |3| - comprueba que las coord sean validas


              // -- ABRIR SOCKET PARA LAS OFERTAS SI HAY VIAEJS PENDIENTES
              if (this.socket_offer === undefined) {
                this.connectSocket();

                // -- enviar data del viaje por socket
                this.sendTravelSocket(this.travels$);

                // -- abrir conexion del socket para las ofertas 
                this.subscribeOffers();
              }
            }
          }

          // -- CERRAR SOCKET PARA LAS OFERTAS SI NO HAY VIAEJS PENDIENTES
          if (this.travels$.id == '') {

            if (this.socket_offer)
              this.disconnectSocket();

          }
        }
      )
    ).subscribe();



  }
  // ---------------------------------------------------
  //TODO -- Obtiene los viajes con estado 'pending' del usuario
  // ---------------------------------------------------

  getTravels(user_id: string) {
    this.subTravels = this.tripTravelerService.getTravels(user_id, 'pending').pipe(
      take(1),
      tap((dataTravel: string | any[]) => {
        if (dataTravel.length !== 0) {

          const data = dataTravel[0]; 
           
          this.dataTravelerService.setTravelData(data);
          
        } else {
          this.dataTravelerService.setTravelData(null);
        }
      }),
      finalize(
        () => {

        }
      ),
      catchError(error => {
        console.error(error);
        return [];
      })
    ).subscribe();
  }

  // ---------------------------------------------------
  //TODO -- Establecer el temporizador
  // ---------------------------------------------------

  setTimer(minutesExp: number, travelId: string) {


    if (travelId != undefined && travelId != '' && !this.interval) {


      this.interval = setInterval(async () => {


        if (this.time.sec === 0) {
          if (this.time.min === 0) {


            this.stopInterval();

            // llamar a la funcion para volver a publicar el viaje
            await this.republishTravel(minutesExp, travelId);

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
  // TODO -- Detener el temporizador
  // -- 
  // 
  stopInterval() {

    this.time.min = -1;
    this.time.sec = -1;
    clearInterval(this.interval);
    this.interval = null;
  }

  async republishTravel(minutesExp: number, travelId: string) {

    if (travelId != undefined && travelId != '') {

      const question = await this.dataService.showQuestion(
        'Su viaje ha expirado, desea volver a publicarlo?',
        '',
        'warning'
      );
      if (question) {

        const dateCreated = new Date();
        const dateFinish = new Date(dateCreated.getTime() + minutesExp * 60000);

        this.travels$.date_created = dateCreated;
        this.travels$.date_finish = dateFinish;
        this.interval = undefined;

        this.dataTravelerService.setTravelData(this.travels$);

        this.updateDateFinish(minutesExp, travelId);


      }
      else if (!question) {

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
      maxTimeWaiting: minutesExp,
      status: 'pending'
    };

    this.tripTravelerService.updateTravelDateFinish(travelData, id).pipe(
      take(1),
      tap(
        data => {
          console.log('entro en updateDateFinish', data);

          const config = this.dataService.openSnackBar('success', 3);
          const snackBarRef = this._snackBar.open('Solicitud realizada con éxito', 'CLOSE', config);
          snackBarRef.afterDismissed().subscribe(() => {

            this.reloadComponent(true);
            this.dataTravelerService.setTravelData(this.travels$);
            this.changeDetectorRef.detectChanges();

          });


        }
      ),
      finalize(
        () => {
          console.log('Petición completada')
          this.reloadComponent(true);
        }
      )
    ).subscribe();

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
      take(1),
      tap(

        data => {
          console.log('entro en updateTravels', data);

          const config = this.dataService.openSnackBar('success', 3);
          const snackBarRef = this._snackBar.open('Solicitud realizada con éxito', 'CLOSE', config);

          snackBarRef.afterDismissed().subscribe(() => {

            if (status == 'expired' || status == 'canceled') {
              this.disconnectSocket();
            }
            this.dataTravelerService.setTravelData(null);
            // window.location.reload();

          });
        }
      ),
      finalize(
        () => {
          console.log('Petición completada')
          this.reloadComponent(true);
        }
      )
    ).subscribe();

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
        this.stopInterval();
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
      this.time.sec = 59;
      return false;
    } else {

      this.time.min = 0;
      this.time.sec = 3;
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

        window.location.reload();
        console.log('Ruta despues de la navegacion', this.router.url);

      });
    });


  }

  // ---------------------------------------------------
  // TODO -- SOCKETS
  // ---------------------------------------------------


  connectSocket() {

    console.log('SOCKET OFFER CONECTADO!')
    this.socket_offer = this.socketioService.connectSocket(environment.socketUrl + '/offer');

    this.socketioService.get_socketStatus(this.socket_offer).subscribe(
      status => {
        this.dataTravelerService.setSocketStatus(status);
      }
    );

  }

  disconnectSocket() {
    if (this.socket_offer) {

      this.socketioService.disconnectSocket(this.socket_offer);
      this.dataTravelerService.setSocketStatus(false);

    }
  }
  // ---------------------------------------------------
  // TODO --  Enviar Travel INICIO
  // ---------------------------------------------------
  // Método para emitir un evento con los datos del viaje
  sendTravelSocket(travel: I_FormTravelRequest) {

    if (travel.id != undefined && travel.id != '')
      try {
        if (this.socket_offer != undefined && this.socket_offer != null)

          console.log('SOCKET sendTravelSocket!', travel)

        this.socket_offer.emit('send-travel', travel);

      } catch (error) {

        console.error('Error al enviar el viaje:', error);

      }



  }

  // ---------------------------------------------------
  // TODO -- Enviar Travel FIN
  // ---------------------------------------------------

  // ---------------------------------------------------
  // TODO -- Obtener OFERTAS
  // ---------------------------------------------------

  subscribeOffers() {
    if (!this.travels$ || this.travels$.id === '') {
      return;
    }

    // -- abrir y subscribirse al socket de ofertas
    this.subscribeOffersSocket();

    // -- subscribirse a las ofertas en la app
    this.subOffers = this.dataTravelerService.getOffers().subscribe(data => {

      console.log('subscribeOffers', data)
      if (data !== undefined && data.length != 0) {
        this.offers$ = data;
      }

    });

  }

  // -- subscribirse al metodo para obtener ofertas
  subscribeOffersSocket() {

    this.subOffersSocket = this.onOffersSocket().subscribe((offersList: any) => {
      // Actualizar la interfaz con la lista de viajes
      console.log(offersList);

      this.dataTravelerService.setOffers(offersList);
    });

  }
  // -- obtener ofertas por socket
  onOffersSocket() {
    if (this.socket_offer != undefined && this.socket_offer != null)
      return this.socket_offer.fromEvent('listen-offers');
    // this.socket.on('listen-offers', (data: I_Offers) => {
    //   this.offers$.push(data); // Agrega la oferta recibida al arreglo de ofertas
    // });
    return [];

  }


  // ---------------------------------------------------
  // TODO -- Obtener OFERTAS
  // ---------------------------------------------------

  // ---------------------------------------------------
  // TODO -- SOCKETS
  // ---------------------------------------------------



}
