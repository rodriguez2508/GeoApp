import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

// -- Openlayers 
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { OSM, Vector } from 'ol/source';
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
import { Stroke, Style } from 'ol/style';
import { LineString } from 'ol/geom';
// -- Openlayers
// --interfaces
import { I_DestinationMarker } from '../../../../../interface/marker.interface';
import { I_UserMap, I_UserSessionStorage } from '../../../../../interface/user.interface';
import { I_ConnectedUser } from '../../../../../interface/user.interface';
// --interfaces
// -- services
import { OlMapMarkerService } from '../../../../../services/map/ol-map-marker.service';
import { DataService } from '../../../../../services/data/data.service';
import { OpenRouteService } from '../../../../../services/map/open-route.service';
import { StorageService } from '../../../../../services/storage/storage.service';
// -- services
// -- constant
import { DEFAULT_HEIGHT, DEFAULT_LAT, DEFAULT_LOCATION_STATUS, DEFAULT_LON, DEFAULT_SOCKET_STATUS, DEFAULT_WIDTH, DEFAULT_ZOOM } from '../../../data/data-map';
import { FooterPageComponent } from '../footer-page/footer-page.component';
// -- constant



@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [FooterPageComponent],
  templateUrl: './map-page.component.html',
  styleUrl: './map-page.component.scss'
})
export class MapPageComponent {

  @Input() lat: number = DEFAULT_LAT;
  @Input() lon: number = DEFAULT_LON;
  @Input() zoom: number = DEFAULT_ZOOM;
  @Input() socket_status: boolean = DEFAULT_SOCKET_STATUS;
  @Input() location_status: boolean = DEFAULT_LOCATION_STATUS;
  @Input() width: string | number = DEFAULT_WIDTH;
  @Input() height: string | number = DEFAULT_HEIGHT;

  @Output() movestart = new EventEmitter<any>();
  @Output() moveend = new EventEmitter<any>();

  coordinates = [this.lon, this.lat];
  private coordinateChanges$ = new Subject<[number, number]>();



  // ------------------
  // -- Marcadores
  // ------------------
  lineRoute: Feature = new Feature();
  markers: Feature[] = [];
  private vectorSource = new VectorSource();
  private vectorLayer = new VectorLayer();
  // ------------------
  // -- Marcadores
  // ------------------


  // -- 

  map: Map = new Map();

  @Input() userData: I_UserSessionStorage = { id: '', user_name: '', user_type: '' };
  @Input() connected_users: I_ConnectedUser[] = [];
  client: I_UserMap;
  // Agregar el control ZoomToExtent al mapa
  center = transform([this.lon, this.lat], 'EPSG:4326', 'EPSG:3857');
  extent = [this.center[0] - 50000, this.center[1] - 50000, this.center[0] + 50000, this.center[1] + 50000];

  private movestartListener: any;  // Mantén una referencia al oyente del evento para poder eliminarlo más tarde
  private moveendtListener: any;  // Mantén una referencia al oyente del evento para poder eliminarlo más tarde

  private mapEl: any;
  private popupEl: any;
  private hasAddedTu: boolean = false;

  footerDisplayed = false;
  methodToShowFooter: string = '';

  address: string = 'buscando..';
  distance: string = '0';

  connected_TravelerUsers: I_ConnectedUser[] = [];
  connected_DriverUsers: I_ConnectedUser[] = [];

  constructor(
    private elementRef: ElementRef,
    private markerService: OlMapMarkerService,
    private dataService: DataService,
    private storageService: StorageService,
    private openRouteService: OpenRouteService
  ) {

    this.client = { id: this.userData.id, user_name: this.userData.user_name, markerColor: 'success' };
  }

  ngOnInit(): void {

    this.mapEl = this.elementRef.nativeElement.querySelector('#map');

    // -- inicializa el mapa
    this.setSize();
    this.initMap();

  }

  ngAfterViewInit(): void {
    this.client = { id: this.userData.id, user_name: this.userData.user_name, markerColor: 'success' };
  }

  ngOnDestroy(): void {

  }

  // --------------------------------------------
  // -- se activa si cambia la latitud y longitud 
  // --------------------------------------------
  ngOnChanges(changes: SimpleChanges): void {

    if (('client' in changes)) {
      this.client = { id: this.userData.id, user_name: this.userData.user_name, markerColor: 'success' };
    }


    // --------------------
    // Controla los cambios en las coordenadas y usuarios activos
    // --------------------
    if (this.map && this.socket_status && this.location_status) {

      if (!this.hasAddedTu) {
        this.client.user_name += ' (Tú)';
        this.client.markerColor = 'success';
        this.initMarker([this.lon, this.lat], this.client);
        this.centerMap();
        this.hasAddedTu = true;
      }

      if (('lat' in changes || 'lon' in changes)) {
        // Si cambia alguna de las propiedades lat, lon, o zoom, actualiza el mapa

        console.log('this.client  update')

        // Actualiza tus marcadores

        this.initMarker([this.lon, this.lat], this.client);


      }
      else if (('connected_users' in changes)) {
        // console.log('connected_user update', this.connected_DriverUsers)

        // this.getAndUpdateConnectedTravelerUsers();
        this.getAndUpdateConnectedDriverUsers();

        // Eliminar los marcadores que no están en this.connected_users 
        const indexToRemove = this.markers.findIndex(marker => !this.connected_DriverUsers.some(user => user.user.id === marker.get('client').id));

        if (indexToRemove !== -1 && this.markers[indexToRemove].get('client').id != 'destination' && this.markers[indexToRemove].get('client').id != this.client.id) this.clearMarker(this.markers[indexToRemove].get('client').id);

        this.setMarkersForConnectedUsers();

      }

    }


  }

  // --------------------------------------------
  // -- Inicializar el mapa
  // --------------------------------------------

  private initMap() {

    // this.vectorSource.addFeatures(this.markers);

    // this.vectorLayer = new VectorLayer({
    //   source: this.vectorSource,
    // });

    // ----------------------------------
    // controles 
    // ----------------------------------   

    const zoomToExtentControl = new ZoomToExtent({
      extent: this.extent,
    });
    const zoomControl = new Zoom();
    const rotateControl = new Rotate();
    const scaleLine = new ScaleLine();

    // ----------------------------------
    // controles 
    // ----------------------------------
    this.map = new Map({
      target: this.mapEl,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.vectorLayer
      ],
      view: new View({
        // projection: 'EPSG:4326',
        center: Proj.fromLonLat([this.lon, this.lat]),
        minZoom: 6,
        maxZoom: 19,
        zoom: this.zoom
      }),
      controls: [rotateControl, zoomControl, scaleLine]
    });

    //  ------------------------------
    // EVENTO CLICK
    //  ------------------------------ 
    this.map.on('singleclick', (event) => {
      // console.log(`Has hecho clic en las coordenadas (${event.coordinate[0]}, ${event.coordinate[1]}).`);

      //  -- Inicializa el marcador destino
      let coord_destination: Coordinate = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
      this.initMarkerDestination(coord_destination);

      // console.log('name street', this.openRouteService.getStreetInformation(coord_destination))


      if (this.location_status) {

        this.showFooterOnMap();

        if (this.footerDisplayed) {

          this.getAddress(coord_destination);

        }

        // //  start=8.681495,49.41461&end=8.687872,49.420318
        // //  Establece los puntos inicio y destiino para dibujar la linea
        // const startPoint = [this.lon, this.lat];
        // const endPoint = coord_destination;
        // this.drawRoute(startPoint, endPoint);
        // this.updateMarkers();
      }

    });

    //  ------------------------------
    // EVENTO CLICK
    //  ------------------------------ 
  }

  // --------------------------------------------
  // -- Actualizar mapa segun latitud y longitud 
  // --------------------------------------------
  private updateMap() {

    // Agregar el control ZoomToExtent al mapa

    // this.center = transform([this.lon, this.lat], 'EPSG:4326', 'EPSG:3857');
    // this.extent = [this.center[0] - 50000, this.center[1] - 50000, this.center[0] + 50000, this.center[1] + 50000];


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
  // -- DRAW EN EL MAPA 
  // --------------------------------------------
  // --------------------------------------------

  private drawRoute(startPoint: Coordinate, endPoint: Coordinate) {

    this.openRouteService.getRoute(startPoint, endPoint).subscribe(
      {
        next: (response: any) => {


          const coordinates = response.features[0].geometry.coordinates;
          console.log(response)

          const styleLine = new Style({
            stroke: new Stroke({
              color: '#FF0000', // Color Rojo
              width: 5 // Ancho Grueso
            })
          });

          this.lineRoute = new Feature({
            geometry: new LineString(coordinates).transform('EPSG:4326', 'EPSG:3857'),
          });

          this.lineRoute.setStyle(styleLine);

          this.updateMarkers(this.lineRoute);

        },
        error: (error: any) => {
          // Manejar errores al obtener el estado del socket
          console.error('Error en la solicitud a GraphHopper:', error);

        },
        complete: () => {
          // Realizar acciones adicionales cuando el observable se completa, si es necesario
        },
      }
    );

  }

  private getAddress(coord: Coordinate) {


    this.openRouteService.getStreetInformation(coord).subscribe(
      {
        next: (response: any) => {

          // const displayName = response.name;
          // const address = response.address;

          // console.log(' n:', response);
          // console.log('Nombre de la ubicación:', displayName);
          // console.log('Dirección detallada:', address);

          console.log(response.address)
          console.log(response.address.road)

          let road = response.address.road; 
          let neighbourhood = response.address.neighbourhood; 
          let suburb = response.address.suburb ; 
          let city = response.address.city; 
           
          const address = `${road=== undefined?'':road+','} ${neighbourhood === undefined?'':neighbourhood+','} ${city}`;

          // const distance = response.features[0]?.properties?.distance;

          // console.log(response.features)
          this.address = address;
          // this.distance = distance;

          // ---------
          // let street = response.features[0]?.properties?.street + ', ';
          // let name = response.features[0]?.properties?.name != response.features[0]?.properties?.street ? response.features[0]?.properties?.name + ', ' : '';

          // const address = street + name + response.features[0]?.properties?.region;

          // const distance = response.features[0]?.properties?.distance;

          // console.log(response.features)
          // this.address = address;
          // this.distance = distance;


        },
        error: (error: any) => {
          // Manejar errores al obtener el estado del socket
          // console.error('Error en la solicitud a ORS:', error);
          this.address = 'Error de conexión.';
          this.distance = '0';

        },
        complete: () => {
          // Realizar acciones adicionales cuando el observable se completa, si es necesario
        },
      }
    );

  }
  // --------------------------------------------
  // --------------------------------------------
  // -- DRAW EN EL MAPA 
  // --------------------------------------------
  // --------------------------------------------




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
  public initMarker(coord: Coordinate, client: I_UserMap | I_DestinationMarker, type: string = '') {


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


    let destination: I_DestinationMarker = {
      id: 'destination',
      user_name: '',
      markerColor: 'danger',
    };

    this.initMarker(coord, destination);

  }

  updateMarkers(feature: Feature = new Feature()) {

    const vectorSource = new VectorSource({
      features: [feature]
    });

    vectorSource.addFeatures(this.markers);

    this.vectorLayer.getSource()?.clear();
    this.vectorLayer.getSource()?.refresh();

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
  public clearMarker(clientId: string): void {

    // Asegúrate de que el servicio y el mapa estén disponibles
    if (this.markerService && this.map) {

      // Buscar el índice del marcador que se va a actualizar
      const indexToUpdate = this.markers.findIndex(marker => marker.get('client').id === clientId);

      // -- el marcador NO existe en el array
      if (indexToUpdate !== -1) {

        this.markers = this.markerService.removeMarker(this.markers, clientId);

        this.updateMarkers();
      }
      else {
        // this.clearMarker(clientId);
      }

    }


  }

  // Función para pintar marcadores para todos los usuarios conectados
  public setMarkersForConnectedUsers() {
    // Asegúrate de tener datos en connected_users y de que el servicio y el mapa estén disponibles
    if (this.connected_DriverUsers.length > 0 && this.markerService && this.map) {
      this.connected_DriverUsers.forEach((user: I_ConnectedUser) => {
        // Verifica si la posición actual está presente en el usuario antes de intentar pintar el marcador
        if (user.currentPosition.lat && user.currentPosition.long) {
          const coord: Coordinate = [
            user.currentPosition.long,
            user.currentPosition.lat,
          ];


          this.markers = this.markers.filter(marker => {
            return this.connected_DriverUsers.some(user => user.user.id === marker.get('client').id);
          });

          this.initMarker([this.lon, this.lat], this.client);

          let client: I_UserMap = { id: user.user.id, user_name: user.user.user_name, markerColor: 'warning' };

          // if (this.client.id == client.id) {

          // }
          // else {

          this.initMarker(coord, client);

          // }

        }
      });
    }
  }



  // --------------------------------------------
  // --------------------------------------------
  // -- MARCADORES EN EL MAPA 
  // --------------------------------------------
  // --------------------------------------------

  // --------------------------------------------
  // --------------------------------------------
  // -- FOOTER 
  // --------------------------------------------
  // --------------------------------------------

  showFooterOnMap() {

    this.footerDisplayed = !this.footerDisplayed;
    if (!this.footerDisplayed) {
      this.clearMarker('destination');
      this.address = 'Buscando...';
      // this.distance = '0';
    }
    this.methodToShowFooter = 'map';


  }
  showFooterOnButton() {
    this.footerDisplayed = !this.footerDisplayed;
    this.address = 'Seleccione un lugar..';
    if (!this.footerDisplayed) {
      this.clearMarker('destination');
      this.address = '';
      // this.distance = '0';
    } 
      this.methodToShowFooter = 'button';

  }
  hideFooter() {
    this.footerDisplayed = false;
  }

  getConnectedUsersByType(userType: string): I_ConnectedUser[] {
    return this.connected_users.filter((user: I_ConnectedUser) => user.user.user_type === userType);
  }

  getAndUpdateConnectedTravelerUsers(): void {
    this.connected_TravelerUsers = this.getConnectedUsersByType('traveler');
  }

  getAndUpdateConnectedDriverUsers(): void {
    this.connected_DriverUsers = this.getConnectedUsersByType('driver');
  }

  // --------------------------------------------
  // --------------------------------------------
  // -- FOOTER 
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
