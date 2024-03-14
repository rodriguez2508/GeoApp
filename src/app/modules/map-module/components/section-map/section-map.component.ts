import { ErrorLocationComponent } from './../../../../components/errors/error-location/error-location.component';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';

// --services
import { GeolocService } from '../../../../services/geolocation/geoloc.service';
import { DataService } from '../../../../services/data/data.service';
import { SocketioService } from '../../../../services/socketio.service'; 
// --services
// --components
import { OlMapComponent } from '../ol-map/ol-map.component';
import { FooterMapComponent } from '../shared/footer-map/footer-map.component'; 
// --components
// --interface
import { I_UserMap, I_UserSessionStorage } from '../../../../interface/user.interface';
import { MARKER_COLOR } from '../../../traveler/data/data-map';
// --interface
@Component({
  selector: 'app-section-map',
  standalone: true,
  imports: [OlMapComponent, ErrorLocationComponent, FooterMapComponent],
  templateUrl: './section-map.component.html',
  styleUrl: './section-map.component.scss'
})
export class SectionMapComponent implements OnInit, AfterViewInit, OnDestroy {

  title_page = "Bienvenido";
  lat: number = 23.0415;
  lon: number = -81.5775;
  zoom: number = 14;
  socket_status: boolean = false;
  location_status: boolean = false;
  max_count: number = 0;

  
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
  
  user_type:string = '';

  constructor(private geolocService: GeolocService, private dataService: DataService, private socketioService: SocketioService) {
     
  }
  ngOnDestroy(): void {

    this.socketioService.disconnect();

  }
  ngAfterViewInit(): void {

    // this.first_iteration = 1;
    
    this.user_type = this.userData.user_type==='traveler'? 'Conductor': 'Viajero';

  }
  ngOnInit() {

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

  reload_location() {
    this.getLocation();
  }

  // -------------------------------------------
  // -- obtener localizacion del usuario
  // -------------------------------------------
  async getLocation() {

    this.geolocService.get_locationStatus().subscribe((value) => {

      this.location_status = value;
    });
    this.geolocService.get_maxcountStatus().subscribe((value) => {

      this.max_count = value;
    });
    this.geolocService.startWatchingPosition((position: GeolocationPosition) => {

      // Aquí puedes manejar la nueva posición del usuario 

      if (Math.floor(this.lat * 10000) !== Math.floor(position.coords.latitude * 10000) || Math.floor(this.lon * 1000) !== Math.floor(position.coords.longitude * 1000)) {
      // if (this.lat != position.coords.latitude || this.lon != position.coords.longitude) {
        this.lat = position.coords.latitude;
        this.lon = position.coords.longitude;

        // -- Actualiza la posicion
        let position_ = { lat: this.lat, long: this.lon };

        // -- Actualiza los datos del Usuario
        let user_:I_UserMap = {id: this.userData.ci, name: this.userData.name, markerColor: 'success', currentPosition: position_ };

        // -- Enviar los datos del usuario al servidor
        this.socketioService.sendUserData(user_);

        // console.log('Pos.Update -> Latitude: ' + position.coords.latitude + ', Longitude: ' + position.coords.longitude);
      }
    });

  }


  // -------------------------------------------
  // -- obtener estado del socket 
  // -------------------------------------------

  async getSocketStatus() {
    this.socketioService.get_socketStatus().subscribe({
      next: (status: boolean) => {

        // -- actualiza el socket_status
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
  // -- obtener lista de usuarios conectados
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



}
