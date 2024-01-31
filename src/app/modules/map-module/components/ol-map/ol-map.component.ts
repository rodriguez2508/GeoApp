import { Component, OnInit, OnChanges, AfterViewInit, Input, ElementRef, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs';


// -- map OL
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { OSM } from 'ol/source';
import * as Proj from 'ol/proj';
import { Coordinate, toStringHDMS } from 'ol/coordinate';
import {
  defaults as defaultControls,
  Control,
  ZoomToExtent,
  Zoom,
  ZoomSlider,
  Rotate,
  MousePosition,
  FullScreen,
  OverviewMap,
  ScaleLine
} from 'ol/control';
import { fromLonLat, toLonLat, transform } from 'ol/proj';

import { Feature, Overlay } from 'ol';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
// -- map OL

import { PopoverModule } from 'ngx-bootstrap/popover';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';


// --- personal imports

// --services
import { OlMapMarkerService } from '../../services/ol-map-marker.service';
import { DataService } from '../../../../services/data.service';
import { StorageService } from '../../../../services/storage.service';
// --services

// --interfaces
import { Client } from '../../../../interface/client.interface';
import { connectedUsers } from '../../../../interface/connectedUsers.interface';
import { DestinationMarker } from '../../../../interface/destinationMarker.interface';
// --interfaces




export const DEFAULT_HEIGHT = '500px';
export const DEFAULT_WIDTH = '500px';

export const DEFAULT_ZOOM = 10;
export const DEFAULT_ONLINE = false;

export const DEFAULT_LAT = 23.0415;
export const DEFAULT_LON = -81.5775;



@Component({
  selector: 'app-ol-map',
  standalone: true,
  imports: [PopoverModule, BsDropdownModule],
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

  coordinates = [this.lon, this.lat];
  private coordinateChanges$ = new Subject<[number, number]>();



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

  // Agregar el control ZoomToExtent al mapa
  center = transform([this.lon, this.lat], 'EPSG:4326', 'EPSG:3857');
  extent = [this.center[0] - 50000, this.center[1] - 50000, this.center[0] + 50000, this.center[1] + 50000];

  private movestartListener: any;  // Mantén una referencia al oyente del evento para poder eliminarlo más tarde
  private moveendtListener: any;  // Mantén una referencia al oyente del evento para poder eliminarlo más tarde

  private mapEl: any;
  private popupEl: any;
  private hasAddedTu: boolean = false;

  constructor(private elementRef: ElementRef, private markerService: OlMapMarkerService, private dataService: DataService, private storageService: StorageService) {

    this.client = storageService.getUser();


  }

  ngOnInit(): void {

    this.mapEl = this.elementRef.nativeElement.querySelector('#map');

    // -- inicializa el mapa
    this.initMap();
  }

  ngAfterViewInit(): void {

    this.setSize();

    // let client: Client = { id: '1', name: 'cliente 2', markerColor: 'warning' };
    // let client2: Client = { id: '2', name: 'cliente 3', markerColor: 'warning' };



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
  // -- Inicializar el mapa
  // --------------------------------------------

  initMap() {

    this.vectorSource.addFeatures(this.markers);

    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
    });

    const targetZoom = this.zoom;


    // ----------------------------------
    // controles 
    // ----------------------------------   

    const zoomToExtentControl = new ZoomToExtent({
      extent: this.extent,
      label: 'Ex',

    });

    // Controles 
    const zoomControl = new Zoom();
    const rotateControl = new Rotate();
    const scaleLine = new ScaleLine();
    // Controles 

    // ----------------------------------
    // controles 
    // ----------------------------------
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
        minZoom: 10,
        maxZoom: 19,
        zoom: targetZoom
      }),
      controls: [zoomToExtentControl, rotateControl, zoomControl, scaleLine]
    });


    // Define un listener para el evento click
    this.map.on('singleclick', (event) => {
      console.log(`Has hecho clic en las coordenadas (${event.coordinate[0]}, ${event.coordinate[1]}).`);

      //  -- Inicializa el marcador destino 
      let coord: Coordinate = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
      this.initMarkerDestination(coord);

    });
  }

  // --------------------------------------------
  // -- Actualizar mapa segun latitud y longitud 
  // --------------------------------------------
  private updateMap() {

    // Agregar el control ZoomToExtent al mapa

    this.center = transform([this.lon, this.lat], 'EPSG:4326', 'EPSG:3857');
    this.extent = [this.center[0] - 50000, this.center[1] - 50000, this.center[0] + 50000, this.center[1] + 50000];
    this.map.render;
  }

  centerMap() {

    // this.map.getView().setCenter(Proj.fromLonLat([this.lon, this.lat]));
    // Función de callback para centrar el mapa en las coordenadas actuales
    const coordinate: Coordinate = transform([this.lon, this.lat], 'EPSG:4326', 'EPSG:3857');
    this.map.getView().animate({ center: coordinate }, { duration: 1000 });
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
  // -- popupEl EN EL MAPA 
  // --------------------------------------------
  // --------------------------------------------
  initPopup() {

    this.popupEl = this.elementRef.nativeElement.querySelector('#popup');
    this.popupEl.style.borderRadius = '10px';
    this.popupEl.style.padding = '10px';
    this.popupEl.style.display = 'none';

  }

  // --------------------------------------------
  // --------------------------------------------
  // -- popupEl EN EL MAPA 
  // --------------------------------------------
  // --------------------------------------------

  // --------------------------------------------
  // --------------------------------------------
  // -- MARCADORES EN EL MAPA 
  // --------------------------------------------
  // --------------------------------------------


  // --------------------------------------------
  // -- inicializar marcador en el mapa 
  // --------------------------------------------
  public initMarker(coord: Coordinate, client: Client | DestinationMarker, type: string = '') {


    // Asegúrate de que el servicio y el mapa estén disponibles
    if (this.markerService && this.map) {

      // Buscar el índice del marcador que se va a actualizar
      const indexToUpdate = this.markers.findIndex(marker => marker.get('client').id === client.id);

      // -- el marcador NO existe en el array
      if (indexToUpdate === -1) {
        this.markers = this.markerService.initMarker(this.markers, coord, client);


      }
      // -- el marcador existe en el array
      else {
        this.markers = this.markerService.updateMarkers(this.markers, coord, client);

        // this.vectorSource.refresh(); 

      }

      this.updateMarkers();

    }

  }

  // -- Inicializa el marcador destino
  initMarkerDestination(coord: Coordinate) {


    let destination: DestinationMarker = {
      id: 'destination',
      name: 'Destino',
      markerColor: 'warning',
    };

    this.initMarker(coord, destination);

  }

  updateMarkers() {

    const vectorSource = new VectorSource({
      features: this.markers
    });


    this.vectorLayer = new VectorLayer({
      source: vectorSource
    });

    this.map.addLayer(this.vectorLayer);

    // this.vectorSource.refresh();
    this.map.render();
  }
  // --------------------------------------------
  // -- Remover marcador en el mapa 
  // --------------------------------------------
  public deleteMarker(clientId: string): void {
  
    // Asegúrate de que el servicio y el mapa estén disponibles
    if (this.markerService && this.map) {

      // Buscar el índice del marcador que se va a actualizar
      const indexToUpdate = this.markers.findIndex(marker => marker.get('client').id === clientId);

      // -- el marcador NO existe en el array
      if (indexToUpdate === -1) {}
      else{
        console.log('init length', this.markers.length)
        this.markerService.removeMarker(this.markers, clientId);
        console.log(this.markers.length)

      }
       
    }


  }
  clearAllMarkers() {

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