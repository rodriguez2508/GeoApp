import { I_Places } from './../../../../interface/places.interface';
import { Component } from '@angular/core';

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
import { SocketioService } from '../../../../services/socketio.service';
import { I_UserMap, I_UserSessionStorage } from '../../../../interface/user.interface';
import { StorageService } from '../../../../services/storage/storage.service';
import { FavoritesPlacesService } from '../../../../services/map/favorites-places.service';
// -- Services

@Component({
  selector: 'app-travel-request',
  standalone: true,
  imports: [FooterPageComponent, MapPageComponent, FormPageComponent],
  templateUrl: './travel-request.component.html',
  styleUrl: './travel-request.component.scss'
})
export class TravelRequestComponent {


  title_page = "Crear Oferta de Viaje";
  lat: number = 23.0415;
  lon: number = -81.5775;
  coord_origin: Coordinate = [];
  coord_destination: Coordinate = [];

  zoom: number = 10;
  socket_status: boolean = false;
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
    type_user: ''
  };

  type_user: string = '';
  viewToShow: string = 'map';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private geolocService: GeolocService,
    private dataService: DataService,
    private storageService: StorageService,
    private socketioService: SocketioService,
    private favoritePlacesService: FavoritesPlacesService) {

    // obtengo el parametro en la ruta
    this.route.queryParams.subscribe(params => {

      // -------------------------------------------
      // -- verifica parametros en la ruta  
      // ------------------------------------------- 
      this.viewToShow = params['view'] ? params['view'] : 'map';

      this.coord_origin = params['view'] == 'form' && params['coord'] ? params['view'] : 'map';



    });


  }
  ngOnDestroy(): void {

    // this.socket_status = false;
    // this.location_status = false;
    this.socketioService.disconnect();
    this.geolocService.stopWatchingPosition();
    // this.max_count = -4;

  }
  ngAfterViewInit(): void {

    // this.first_iteration = 1;

    this.type_user = this.userData.type_user === 'traveler' ? 'Conductor' : 'Viajero';

    this.getFavoritePlaces(this.userData.id);

  }
  ngOnInit() {

    this.userData = this.storageService.getUser();

    if (this.viewToShow == 'map') {

      // -------------------------------------------
      // -- obtener localizacion  
      // -------------------------------------------

      this.getLocation();


      this.socketioService.connect();

      // -------------------------------------------
      // -- obtener estado del socket 
      // -------------------------------------------
      this.getSocketStatus();
      // -------------------------------------------
      // -- obtener lista de usuarios conectados
      // -------------------------------------------
      this.getConnectedUsers();

    }
  }


  // -------------------------------------------
  // TODO -- cancela la busqueda de la localizacion y vueve a obtener localizacion del usuario
  // -------------------------------------------
  reload_location() {

    this.geolocService.stopWatchingPosition();

    this.getLocation();
  }

  // -------------------------------------------
  // TODO -- obtener localizacion del usuario
  // -------------------------------------------
  async getLocation() {
 
    this.geolocService.startWatchingPosition((position: Coordinate) => {

      // Aquí puedes manejar la nueva posición del usuario 

      if (Math.floor(this.lat * 10000) !== Math.floor(position[1] * 10000) || Math.floor(this.lon * 1000) !== Math.floor(position[0] * 1000)) {
        // if (this.lat != position.coords.latitude || this.lon != position.coords.longitude) {
        this.lat = position[1];
        this.lon = position[0];

        let position_ = { lat: this.lat, long: this.lon };

        let user_: I_UserMap = {
          id: this.userData.ci,
          name: this.userData.name,
          markerColor: 'success', currentPosition: position_
        };


        // -- Enviar los datos del usuario al servidor
        this.socketioService.sendUserData(user_);

        console.log('Pos.Update -> Latitude: ' + position[1] + ', Longitude: ' + position[0]);
      }
    });


    this.geolocService.get_locationStatus().subscribe((value) => {

      this.location_status = value;
    });
    this.geolocService.get_maxcountStatus().subscribe((value) => {
      console.log(this.max_count);
      this.max_count = value;
    });

  }


  // -------------------------------------------
  // TODO -- obtener estado del socket 
  // -------------------------------------------

  async getSocketStatus() {
    this.socketioService.get_socketStatus().subscribe({
      next: (status: boolean) => {
        this.socket_status = status;
        console.log('Socket status updated:', status);

      },
      error: (error: any) => {
        // Manejar errores al obtener el estado del socket
        console.error('Error getting socket status:', error);

        this.socket_status = false;
      },
      complete: () => {
        // Realizar acciones adicionales cuando el observable se completa, si es necesario
      },
    });
  }


  // -------------------------------------------
  // TODO -- obtener lista de usuarios conectados
  // -------------------------------------------
  async getConnectedUsers() {

    // Llama al método para obtener la lista de usuarios conectados
    this.socketioService.getConnectedUsers().subscribe({
      next: (users: I_UserMap[]) => {

        // -- Guardar los usuarios conectados
        this.connected_users = users;


        // -- Pintar en el mapa los usuarios conectados


      },
      error: (error: any) => {
        this.connected_users = [];
      },
      complete: () => {

        // Realizar acciones cuando el observable se completa, si es necesario
      },
    });

  }

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
                description: data[i].description,
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

}
