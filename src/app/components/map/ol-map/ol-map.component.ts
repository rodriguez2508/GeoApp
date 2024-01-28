import { Component, OnInit, OnChanges, AfterViewInit, Input, ElementRef, SimpleChanges, Output, EventEmitter } from '@angular/core';

import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { OSM } from 'ol/source';
import * as Proj from 'ol/proj';
import { Coordinate } from 'ol/coordinate';


// ------------------
// -- Marcadores
// ------------------

import { Feature } from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

// ------------------
// -- Marcadores
// ------------------

// --- personal imports
import { OlMapMarkerService } from '../../../services/map/ol-map-marker.service';
import { Client } from '../../../interface/client.interface';
import { DataService } from '../../../services/data.service';
import { StorageService } from '../../../services/storage.service';
import { connectedUsers } from '../../../interface/connectedUsers.interface';
import {
  defaults as defaultControls,
  Control
} from 'ol/control';



export const DEFAULT_HEIGHT = '500px';
export const DEFAULT_WIDTH = '500px';

export const DEFAULT_ZOOM = 10;
export const DEFAULT_ONLINE = false;

export const DEFAULT_LAT = 23.0415;
export const DEFAULT_LON = -81.5775;



@Component({
  selector: 'app-ol-map',
  standalone: true,
  imports: [],
  templateUrl: './ol-map.component.html',
  styleUrl: './ol-map.component.scss'
})
export class OlMapComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() lat: number = DEFAULT_LAT;
  @Input() lon: number = DEFAULT_LON;
  @Input() zoom: number = DEFAULT_ZOOM;
  @Input() online: boolean = DEFAULT_ONLINE;
  @Input() width: string | number = DEFAULT_WIDTH;
  @Input() height: string | number = DEFAULT_HEIGHT;

  @Output() movestart = new EventEmitter<any>();
  @Output() moveend = new EventEmitter<any>();

  // ------------------
  // -- Marcadores
  // ------------------

  markers: Feature[] = [];
  private vectorSource = new VectorSource();
  private vectorLayer = new VectorLayer();
  // ------------------
  // -- Marcadores
  // ------------------


  // -- 

  target: string = '#map';
  map: Map = new Map();
  client: Client;
  @Input() conected_users: connectedUsers[] = []; // Asegúrate de inicializar correctamente la lista

  private movestartListener: any;  // Mantén una referencia al oyente del evento para poder eliminarlo más tarde
  private moveendtListener: any;  // Mantén una referencia al oyente del evento para poder eliminarlo más tarde

  private mapEl: any;
  private hasAddedTu: boolean = false;

  constructor(private elementRef: ElementRef, private markerService: OlMapMarkerService, private dataService: DataService, private storageService: StorageService) {

    this.client = storageService.getUser();



    // this.mapEl = this.elementRef.nativeElement.querySelector('#map');

  }

  ngOnInit(): void {

    this.mapEl = this.elementRef.nativeElement.querySelector('#map');

  }

  ngAfterViewInit(): void {

    this.setSize();


    let client: Client = { id: '1', name: 'cliente 2', markerColor: 'warning' };
    let client2: Client = { id: '2', name: 'cliente 3', markerColor: 'warning' };

    // this.initMarker([-81.5775, 23.0415], client)


    this.initMap();


    this.setMarkersForConnectedUsers();
  }

  // --------------------------------------------
  // -- se activa si cambia la latitud y longitud 
  // --------------------------------------------
  ngOnChanges(changes: SimpleChanges): void {

    if (this.map) {
      if ('lat' in changes || 'lon' in changes) {
        // Si cambia alguna de las propiedades lat, lon, o zoom, actualiza el mapa

        console.log('this.client  update')

        this.client.markerColor = 'success';
        if (!this.hasAddedTu) {
          this.client.name += ' (Tú)';
          this.hasAddedTu = true;
        }
        // Actualiza tus marcadores
        // this.markerService.updateMarkers(this.map, [this.lon, this.lat], this.client);
        this.initMarker([this.lon, this.lat], this.client);
        this.updateMap();
      }
      else if ('conected_users' in changes) {
        console.log('connected_user update')
        this.setMarkersForConnectedUsers();


      }
    }


  }

  // --------------------------------------------
  // -- Inicializar el mapa segun latitud y longitud 
  // --------------------------------------------

  initMap() {

    this.vectorSource.addFeatures(this.markers);

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
    });


    this.map = new Map({
      target: this.mapEl,
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.vectorLayer
      ],
      view: new View({
        center: Proj.fromLonLat([this.lon, this.lat]),
        // minZoom: 5,
        maxZoom: 19,
        zoom: this.zoom
      }),
      controls: defaultControls({ attribution: true, zoom: true }).extend([])
    });



    this.updateMap();

    // // Agregar las features al vectorSource
    // this.vectorSource.addFeatures(this.markers);

    // // Agregar la capa del vector al mapa
    // this.map.addLayer(this.vectorLayer);


    // Añade un oyente al evento "movestart"
    // this.movestartListener = this.map.on('movestart', () => {

    // });

    // this.map.on("moveend", (e) => {
    //   this.moveend.emit(e);



    // });
    // this.map.on("movestart", (e) => {
    //   this.movestart.emit(e);

    // });
  }

  // --------------------------------------------
  // -- Actualizar mapa segun latitud y longitud 
  // --------------------------------------------
  private updateMap() {

    this.map.getView().setCenter(Proj.fromLonLat([this.lon, this.lat]));
    this.map.render();

    // this.map.getView().setZoom(this.zoom);
  }


  // --------------------------------------------
  // -- Establecer tamaño del mapa 
  // --------------------------------------------
  private setSize() {
    if (this.mapEl) {
      const styles = this.mapEl.style;
      styles.height = coerceCssPixelValue(this.height) || DEFAULT_HEIGHT;
      styles.width = coerceCssPixelValue(this.width) || DEFAULT_WIDTH;
    }
  }



  // --------------------------------------------
  // --------------------------------------------
  // -- MARCADORES EN EL MAPA 
  // --------------------------------------------
  // --------------------------------------------


  // --------------------------------------------
  // -- inicializar marcador en el mapa 
  // --------------------------------------------
  public initMarker(coord: Coordinate, client: Client) {

    // Asegúrate de que el servicio y el mapa estén disponibles
    if (this.markerService && this.map) {

      // Buscar el índice del marcador que se va a actualizar
      const indexToUpdate = this.markers.findIndex(marker => marker.get('client').id === client.id);

      // -- el marcador NO existe en el array
      if (indexToUpdate === -1) {
        this.markers = this.markerService.initMarker(this.markers, coord, client);
        // const i = this.markers.findIndex(marker => marker.get('client').id === client.id);
        // this.vectorSource.addFeature(this.markers[i]);



        const vectorSource = new VectorSource({
          features: this.markers
        }); 
 

        this.vectorLayer = new VectorLayer({
          source: vectorSource
        });

        this.map.addLayer(this.vectorLayer);

        // this.vectorSource.refresh();

      }
      // -- el marcador existe en el array
      else {
        this.markers = this.markerService.updateMarkers(this.markers, coord, client);


      }
      // this.vectorSource.refresh();
      this.map.render();
    }

  }


  // // --------------------------------------------
  // // -- Actualizar marcador en el mapa 
  // // --------------------------------------------
  // public updateMarker(coord: Coordinate, client: Client) {
  //   console.log('Actualizar marcador en el mapa ')
  //   // Asegúrate de que el servicio y el mapa estén disponibles
  //   if (this.markerService && this.map) {

  //     // Buscar el índice del marcador que se va a actualizar
  //     const indexToUpdate = this.markers.findIndex(marker => marker.get('client').id === client.id);

  //     if (indexToUpdate === -1) {
  //       this.markers = this.markerService.initMarker(this.markers, coord, client);
  //     }
  //     else {
  //       this.markers = this.markerService.updateMarkers(this.markers, coord, client);
  //     }


  //     // this.vectorSource.refresh();
  //     this.map.render();

  //   }


  // }

  // --------------------------------------------
  // -- Remover marcador en el mapa 
  // --------------------------------------------
  public deleteMarker(client: Client): void {

    // Asegúrate de que el servicio y el mapa estén disponibles
    if (this.markerService && this.map) {

      const marker = this.markerService.findMarker(this.markers, client)

      this.vectorSource.removeFeature(marker);

    }



  }


  // Función para pintar marcadores para todos los usuarios conectados
  public setMarkersForConnectedUsers(update: boolean = false) {
    // Asegúrate de tener datos en conected_users y de que el servicio y el mapa estén disponibles
    if (this.conected_users.length > 0 && this.markerService && this.map) {
      this.conected_users.forEach((user: connectedUsers) => {
        // Verifica si la posición actual está presente en el usuario antes de intentar pintar el marcador
        if (user.currentPosition && user.currentPosition.lat && user.currentPosition.long) {
          const coord: Coordinate = [
            user.currentPosition.long,
            user.currentPosition.lat,
          ];

          let client: Client = { id: user.user.id, name: user.user.name, markerColor: 'danger' };

          // let client2: Client = { id: '2', name: 'cliente 3', markerColor: 'warning' };

          // this.initMarker([-81.5775, 23.0415], client2)


          if (this.client.id == client.id) { }
          else {

            // console.log('connected_user update 2', client)
            this.initMarker(coord, client);


          }

        }
      });
    }
  }



  // --------------------------------------------
  // --------------------------------------------
  // -- MARCADORES EN EL MAPA 
  // --------------------------------------------
  // --------------------------------------------


}


// --------------------------------------------
// -- Propiedades de estilos necesarias para pintar el mapa 
// --------------------------------------------
const cssUnitsPattern = /([A-Za-z%]+)$/;

function coerceCssPixelValue(value: any): string {
  if (value == null) {
    return '';
  }

  return cssUnitsPattern.test(value) ? value : `${value}px`;
}