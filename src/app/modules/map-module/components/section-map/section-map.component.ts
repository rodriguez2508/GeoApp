import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { OlMapComponent } from '../ol-map/ol-map.component';
import { GeolocService } from '../../../../services/geoloc.service';
import { DataService } from '../../../../services/data.service';
import { SocketioService } from '../../../../services/socketio.service';
import { Client } from '../../../../interface/client.interface';
import { StorageService } from '../../../../services/storage.service';
import { FooterMapComponent } from './footer-map/footer-map.component';
import { connectedUsers } from '../../../../interface/connectedUsers.interface';
import { Subscription } from 'rxjs';
import { OlMapMarkerComponent } from '../ol-map-marker/ol-map-marker.component';
import { Observable } from 'ol';

@Component({
  selector: 'app-section-map',
  standalone: true,
  imports: [OlMapComponent, FooterMapComponent],
  templateUrl: './section-map.component.html',
  styleUrl: './section-map.component.scss'
})
export class SectionMapComponent implements OnInit, AfterViewInit, OnDestroy {

  title_page = "Simple Map Viewer"
  lat: number = 23.0415;
  lon: number = -81.5775;
  zoom: number = 10;
  online: boolean = false;
  max_count: number = 0;

  conected_users: connectedUsers[] = [];
  client: Client;

  constructor(private geolocService: GeolocService, private dataService: DataService, private socketioService: SocketioService, private storageService: StorageService) {


    this.client = storageService.getUser();
  }
  ngOnDestroy(): void {

    this.socketioService.disconnect();

  }
  ngAfterViewInit(): void {

    // -------------------------------------------
    // -- obtener estado del socket 
    // -------------------------------------------
    this.getSocketStatus();
    // -------------------------------------------
    // -- obtener lista de usuarios conectados
    // -------------------------------------------
    this.getConnectedUsers();

  }
  ngOnInit() {

    this.socketioService.connect();


    // -------------------------------------------
    // -- obtener localizacion  
    // -------------------------------------------
    this.getLocation();

  }

  reload_location() {
    this.getLocation();
  }

  // -------------------------------------------
  // -- obtener localizacion del usuario
  // -------------------------------------------
  getLocation() {

    this.geolocService.get_max_count().subscribe((value) => {

      this.max_count = value;
    });
    this.geolocService.startWatchingPosition((position: GeolocationPosition) => {

      // Aquí puedes manejar la nueva posición del usuario 

      if (this.lat != position.coords.latitude || this.lon != position.coords.longitude) {
        this.lat = position.coords.latitude;
        this.lon = position.coords.longitude;


        let user_ = { id: this.client.id, name: this.client.name };
        let position_ = { lat: this.lat, long: this.lon };

        // -- Enviar los datos del usuario al servidor
        this.socketioService.sendUserData(user_, position_);

        console.log('Posición Atualizada -> Latitude: ' + position.coords.latitude + ', Longitude: ' + position.coords.longitude);
      }
    });

  }


  // -------------------------------------------
  // -- obtener estado del socket 
  // -------------------------------------------

  async getSocketStatus() {
    this.socketioService.get_socketStatus().subscribe({
      next: (status: boolean) => {
        this.online = status;
        console.log('Socket status updated:', status);

        // Si el socket está en línea, enviar los datos del usuario al servidor
        if (status) {

          let user = { id: this.client.id, name: this.client.name };
          let position = { lat: this.lat, long: this.lon };

          // -- Enviar los datos del usuario al servidor
          this.socketioService.sendUserData(user, position);
        }
      },
      error: (error: any) => {
        // Manejar errores al obtener el estado del socket
        console.error('Error getting socket status:', error);
        this.online = false;
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
      next: (users: connectedUsers[]) => {

        // -- Guardar los usuarios conectados
        this.conected_users = users;


        // -- Pintar en el mapa los usuarios conectados


      },
      error: (error: any) => {
        this.conected_users = [];
      },
      complete: () => {

        // Realizar acciones cuando el observable se completa, si es necesario
      },
    });

  }



}
