import { Component } from '@angular/core';

// -- Components
import { MapPageComponent } from './map-page/map-page.component';
import { FooterPageComponent } from './footer-page/footer-page.component';
// -- Components
// -- Interfaces
import { I_ConnectedUser, I_UserSessionStorage } from '../../../../interface/user.interface';
// -- Interfaces
// -- Services
import { GeolocService } from '../../../../services/geolocation/geoloc.service';
import { DataService } from '../../../../services/data/data.service';
import { SocketioService } from '../../../../services/socketio.service';
import { StorageService } from '../../../../services/storage/storage.service';
import { FormPageComponent } from './form-page/form-page.component';
import { Coordinate } from 'ol/coordinate';
import { ActivatedRoute, Router } from '@angular/router';
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

  zoom: number = 14;
  socket_status: boolean = false;
  location_status: boolean = false;
  max_count: number = 0;

  connected_users: I_ConnectedUser[] = [];
  userData: I_UserSessionStorage = { id: '', user_name: '', user_type: '' };

  type_user: string = '';
  viewToShow: string = 'map';

  constructor(private router: Router, private route: ActivatedRoute, private geolocService: GeolocService, private dataService: DataService, private socketioService: SocketioService, private storageService: StorageService) {

    // obtengo el parametro en la ruta
    this.route.queryParams.subscribe(params => {

       // -------------------------------------------
      // -- verifica parametros en la ruta  
      // ------------------------------------------- 
      this.viewToShow = params['view']? params['view'] : 'map'; 
      
      this.coord_origin = params['view']== 'form' && params['coord'] ? params['view'] : 'map'; 



    });


    // obtengo los datos de sesion del usuario
    this.dataService.getUserData().subscribe((value) => {
      this.userData = value;
    });
    // this.client = storageService.getUser();



  }
  ngOnDestroy(): void {

    this.socketioService.disconnect();

  }
  ngAfterViewInit(): void {

    // this.first_iteration = 1;

    this.type_user = this.userData.user_type === 'traveler' ? 'Conductor' : 'Viajero';

  }
  ngOnInit() {


    if(this.viewToShow == 'map'){
      
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

  reload_location() {
    this.getLocation();
  }

  // -------------------------------------------
  // -- obtener localizacion del usuario
  // -------------------------------------------
  async getLocation() {

    this.max_count = 0;
    
    this.geolocService.get_locationStatus().subscribe((value) => {

      this.location_status = value;
    });
    this.geolocService.get_maxcountStatus().subscribe((value) => {
      console.log(this.max_count);
      this.max_count = value;
    });
    this.geolocService.startWatchingPosition((position: GeolocationPosition) => {

      // Aquí puedes manejar la nueva posición del usuario 

      if (Math.floor(this.lat * 10000) !== Math.floor(position.coords.latitude * 10000) || Math.floor(this.lon * 1000) !== Math.floor(position.coords.longitude * 1000)) {
        // if (this.lat != position.coords.latitude || this.lon != position.coords.longitude) {
        this.lat = position.coords.latitude;
        this.lon = position.coords.longitude;


        let user_: I_UserSessionStorage = this.userData;
        let position_ = { lat: this.lat, long: this.lon };

        // -- Enviar los datos del usuario al servidor
        this.socketioService.sendUserData(user_, position_);

        console.log('Pos.Update -> Latitude: ' + position.coords.latitude + ', Longitude: ' + position.coords.longitude);
      }
    });

  }


  // -------------------------------------------
  // -- obtener estado del socket 
  // -------------------------------------------

  async getSocketStatus() {
    this.socketioService.get_socketStatus().subscribe({
      next: (status: boolean) => {
        this.socket_status = status;
        console.log('Socket status updated:', status);

        // Si el socket está en línea, enviar los datos del usuario al servidor
        if (status) {

          let user = { id: this.userData.id, name: this.userData.user_name };
          let position = { lat: this.lat, long: this.lon };

          // -- Enviar los datos del usuario al servidor
          // this.socketioService.sendUserData(user, position);
        }
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
  // -- obtener lista de usuarios conectados
  // -------------------------------------------
  async getConnectedUsers() {

    // Llama al método para obtener la lista de usuarios conectados
    this.socketioService.getConnectedUsers().subscribe({
      next: (users: I_ConnectedUser[]) => {

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


}
