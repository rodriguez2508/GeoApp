
import { I_Places } from './../../../../interface/places.interface';
import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { Coordinate } from 'ol/coordinate';
import { ActivatedRoute, Router } from '@angular/router';


// -- Components
import { MapPageComponent } from './map-page/map-page.component';
import { FormPageComponent } from './form-page/form-page.component';
import { FooterPageComponent } from './footer-page/footer-page.component';
// -- Components

// -- Interfaces
// -- Interfaces

// -- Services
import { GeolocService } from '../../../../services/geolocation/geoloc.service';
import { DataService } from '../../../../services/data/data.service';
import { I_UserMap, I_UserSessionStorage } from '../../../../interface/user.interface';
import { StorageService } from '../../../../services/storage/storage.service';
import { FavoritesPlacesService } from '../../../../services/map/favorites-places.service';
import { SocketioServices } from '../../../../services/sockets/socketio.service';
import { Socket } from 'ngx-socket-io';
import { environment } from '../../../../../environments/environment';
import { DataTravelerService } from '../../../../services/data/data_traveler.service';
// -- Services

@Component({
  selector: 'app-travel-request',
  standalone: true,
  imports: [FooterPageComponent, MapPageComponent, FormPageComponent],
  templateUrl: './travel-request.component.html',
  styleUrl: './travel-request.component.scss'
})
export class TravelRequestComponent implements OnInit, AfterViewInit, OnChanges {


  title_page = "Crear Oferta de Viaje";
  lat: number = 23.0415;
  lon: number = -81.5775;
  coord_origin: Coordinate = [];
  coord_destination: Coordinate = [];

  zoom: number = 10;
  status: boolean = false;
  socket_status: boolean = true;
  location_status: boolean = false;
  max_count: number = 0;

  favoriteMarkers: I_Places[] = [];
  connected_users: I_UserMap[] = [];
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

  user_type: string = '';
  viewToShow: string = 'map';


  // --------------------------------------------------- 
  // TODO estado del socket INICIO 
  // ---------------------------------------------------

  socket_status$: boolean = false;
  socket: any;
  // ---------------------------------------------------
  // TODO estado del socket FINAL
  // ---------------------------------------------------


  constructor(
    // private socket:Socket,
    private socketioService: SocketioServices,
    private router: Router,
    private route: ActivatedRoute,
    private geolocService: GeolocService,
    private dataService: DataService,
    private dataTravelerService: DataTravelerService,
    private storageService: StorageService,
    private favoritePlacesService: FavoritesPlacesService) {

    // obtengo el parametro en la ruta
    this.route.queryParams.subscribe(params => {

      // -------------------------------------------
      // -- verifica parametros en la ruta  
      // ------------------------------------------- 
      this.viewToShow = params['view'] ? params['view'] : 'map';

      this.coord_origin = params['view'] == 'form' && params['coord'] ? params['view'] : 'map';

    });


    // this.reload_location();



  }
  ngOnChanges(changes: SimpleChanges): void {

    if ('socket_status' in changes) {

    }

    if ('status' in changes) {

    }
  }
  ngOnDestroy(): void {

    this.disconnectSocket();
 
  }
  ngAfterViewInit(): void {

  

  }
  async ngOnInit() {
 
    this.userData = this.storageService.getUser();
    this.user_type = this.userData.user_type === 'traveler' ? 'Conductor' : 'Viajero';

    // TODO -- Obtener lugares favoritos

    this.getFavoritePlaces(this.userData.id);

    // TODO -- Obtener lugares favoritos
    
    // ------

    // TODO -- Conexion al Socket

    this.connectSocket();
    this.subscribeSocketStatus();

    // TODO -- Conexion a la location

    this.geolocService.get_locationStatus().subscribe((value) => {

      this.location_status = value;
    });
    this.subscribeLocation();

    // TODO -- Conexion a la location


  }


  // -------------------------------------------
  // TODO -- cancela la busqueda de la localizacion y vueve a obtener localizacion del usuario
  // -------------------------------------------
  reload_location() {

    this.geolocService.stopWatchingPosition();

    this.getLocation();
  }

  reload_socket() {

    // this.socketioService.disconnect();
    this.disconnectSocket();
    this.connectSocket();
    // this.socketioService.connect();
  }

  // -------------------------------------------
  // TODO -- obtener localizacion del usuario
  // -------------------------------------------

  subscribeLocation() {

    this.getLocation();

    this.dataTravelerService.getLocation().subscribe(data => {

      console.log('subscribeLocation', data)
      if (data !== undefined) {

        this.lat = data[1];
        this.lon = data[0];
        this.coord_origin = data;
      }

    });



  }
  async getLocation() {

    this.geolocService.startWatchingPosition((position: Coordinate) => {

      // Aquí puedes manejar la nueva posición del usuario 

      if (Math.floor(this.lat * 10000) !== Math.floor(position[1] * 10000) || Math.floor(this.lon * 1000) !== Math.floor(position[0] * 1000)) {
        // if (this.lat != position.coords.latitude || this.lon != position.coords.longitude) {

        // this.lat = position[1];
        // this.lon = position[0];

        this.dataTravelerService.setLocation(position);


        // let position_ = { lat: this.lat, long: this.lon };

        // let user_: I_UserMap = {
        //   id: this.userData.ci,
        //   name: this.userData.name,
        //   markerColor: 'success', currentPosition: position_
        // };


        // -- Enviar los datos del usuario al servidor
        // this.socketioService.sendUserData(user_);

        console.log('Pos.Update -> Latitude: ' + position[1] + ', Longitude: ' + position[0]);
      }
    });

    this.geolocService.get_maxcountStatus().subscribe((value) => {
      // console.log(this.max_count);
      this.max_count = value;
    });

  }



  // -------------------------------------------
  // TODO -- obtener lista de usuarios conectados
  // -------------------------------------------
  // async getConnectedUsers() {

  //   // Llama al método para obtener la lista de usuarios conectados
  //   this.socketioService.getConnectedUsers().subscribe({
  //     next: (users: I_UserMap[]) => {

  //       // -- Guardar los usuarios conectados
  //       this.connected_users = users;


  //       // -- Pintar en el mapa los usuarios conectados


  //     },
  //     error: (error: any) => {
  //       this.connected_users = [];
  //     },
  //     complete: () => {

  //       // Realizar acciones cuando el observable se completa, si es necesario
  //     },
  //   });

  // }

  // ---------------------------------------------------
  // TODO -- Obtiene los lugares favoritos del usuario
  // ---------------------------------------------------
  getFavoritePlaces(user_id: string) {


    this.favoritePlacesService.getPlaceByUser(user_id).subscribe(
      {
        next: (data) => {

          if (data && data.length != 0) {

            for (let i = 0; i < data.length; i++) {
              this.favoriteMarkers[i] = {
                coordinates: data[i].coordinates,
                address: data[i].address,
                name: data[i].name,
              };
            }
          }

          console.log(this.favoriteMarkers)

        },
        error: (error) => {
          console.log(error)
        }
      }

    );

  }



  // ---------------------------------------------------
  // TODO -- SOCKETS
  // ---------------------------------------------------

  connectSocket() {

    this.socket = this.socketioService.connectSocket(environment.socketUrl);

    this.socketioService.get_socketStatus(this.socket).subscribe(
      status => {
        this.dataTravelerService.setSocketStatus(status);
      }
    );

    // this.dataTravelerService.setSocketStatus(true);

  }

  subscribeSocketStatus() {

    this.dataTravelerService.getSocketStatus().subscribe(data => {

      console.log('subscribeSocketStatus', data)
      if (data !== undefined) {
        this.socket_status$ = data;
      }

    });



  }
  disconnectSocket() {
    if (this.socket) {

      this.socketioService.disconnectSocket(this.socket);
      this.dataTravelerService.setSocketStatus(false);

    }
  } 
  // ---------------------------------------------------
  // TODO -- SOCKETS
  // ---------------------------------------------------


}
