import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


// -- constant
import {
  DEFAULT_HEIGHT,
  DEFAULT_LAT,
  DEFAULT_LOCATION_STATUS,
  DEFAULT_LON,
  DEFAULT_SOCKET_STATUS,
  DEFAULT_WIDTH,
  DEFAULT_ZOOM,
} from '../../../data/data-map';
// --
import { Feature, View } from 'ol';
import Map from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import VectorLayer from 'ol/layer/Vector';
import { transform } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import { OSM } from 'ol/source';
import * as Proj from 'ol/proj';
import { Extent, defaults as defaultInteractions } from 'ol/interaction';
import { ZoomToExtent, Zoom, Rotate, ScaleLine } from 'ol/control';
import { LineString } from 'ol/geom';
import { Style, Stroke } from 'ol/style';

// --
import { I_DestinationMarker } from '../../../../../interface/marker.interface';
import { I_Places } from '../../../../../interface/places.interface';
import { I_UserSessionStorage, I_UserMap } from '../../../../../interface/user.interface';
// --
import { OlMapMarkerService } from '../../../../../services/map/ol-map-marker.service';
import { OpenRouteService } from '../../../../../services/map/open-route.service';
import { getCenter } from 'ol/extent';

@Component({
  selector: 'app-p-map-route',
  standalone: true,
  imports: [],
  templateUrl: './p-map-route.component.html',
  styleUrl: './p-map-route.component.scss'
})
export class PMapRouteComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() zoom: number = DEFAULT_ZOOM;
  @Input() width: string | number = DEFAULT_WIDTH;
  @Input() height: string | number = DEFAULT_HEIGHT;

  @Input() favoriteMarkers: I_Places[] = [];

  // --
  @Input() coord: Coordinate = [0, 0];
  @Input() coord_destination: Coordinate = [0, 0];


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

  @Input() userData: I_UserSessionStorage = {
    id: '',
    ci: '',
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone: '',
    user_type: ''
  };
  @Input() connected_users: I_UserMap[] = [];
  client: I_UserMap;


  // Agregar el control ZoomToExtent al mapa
  extent = [this.coord[0], this.coord[1], this.coord_destination[0], this.coord_destination[1]];
  center = getCenter(this.extent);
  // center = transform(this.coord, 'EPSG:4326', 'EPSG:3857');

  private movestartListener: any; // Mantén una referencia al oyente del evento para poder eliminarlo más tarde
  private moveendtListener: any; // Mantén una referencia al oyente del evento para poder eliminarlo más tarde

  private mapEl: any;
  private popupEl: any;
  private hasAddedTu: boolean = false;

  footerDisplayed = false;
  methodToShowFooter: string = '';

  address: string = 'buscando..';
  distance: string = '0';

  // --
  connected_TravelerUsers: I_UserMap[] = [];
  connected_DriverUsers: I_UserMap[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private elementRef: ElementRef,
    private markerService: OlMapMarkerService,
    private openRouteService: OpenRouteService
  ) {

    this.client = {
      id: this.userData.id,
      name: this.userData.name,
      markerColor: 'primary',
      currentPosition: { lat: this.coord[1], long: this.coord[0] }
    };
  }


  ngAfterViewInit(): void {


    const coord_origin = Proj.fromLonLat(this.coord);
    const coord_destination = Proj.fromLonLat(this.coord_destination);
    const extent = [coord_origin[0], coord_origin[1], coord_destination[0], coord_destination[1]];
      // Ajusta el centro y el zoom del mapa para que la extensión sea visible
      this.map.getView().fit(extent ); // Puedes ajustar el padding según tus necesidades


  }
  ngOnChanges(changes: SimpleChanges): void {

  }



  ngOnInit(): void {
    this.mapEl = this.elementRef.nativeElement.querySelector('#map');

    // -- inicializa el mapa


    if (this.checkCoordinates('origin') && this.checkCoordinates('destination')) {

      this.setSize();

      const extent = [this.coord[0], this.coord[1], this.coord_destination[0], this.coord_destination[1]];
      this.center = getCenter(extent);
      this.initMap();

      // -- marcador origen
      this.initMarker(this.coord, this.client);
      // -- marcador destino
      this.initMarkerDestination(this.coord_destination);
      // -- trazar la ruta:
      this.drawRoute(this.coord, this.coord_destination);

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
      interactions: defaultInteractions({ dragPan: false, mouseWheelZoom:false }),
      target: this.mapEl,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.vectorLayer,
      ],
      view: new View({
        // projection: 'EPSG:4326',
        center: Proj.fromLonLat(this.center),
        // minZoom: 6,
        // maxZoom: 19,
         zoom: this.zoom,
      }),
      controls: [rotateControl, scaleLine],
    });


  }


  centerMap(zoom: number = 15) {
    // this.map.getView().setCenter(Proj.fromLonLat([this.lon, this.lat]));
    // Función de callback para centrar el mapa en las coordenadas actuales
    const coordinate: Coordinate = transform(
      this.coord,
      'EPSG:4326',
      'EPSG:3857'
    );
    this.map.getView().animate({ center: coordinate, zoom: zoom }, { duration: 1000 });
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
    this.openRouteService.getRoute(startPoint, endPoint).subscribe({
      next: (response: any) => {
        const coordinates = response.features[0].geometry.coordinates;
        console.log(response);

        const styleLine = new Style({
          stroke: new Stroke({
            color: '#FF0000', // Color Rojo
            width: 5, // Ancho Grueso
          }),
        });

        this.lineRoute = new Feature({
          geometry: new LineString(coordinates).transform(
            'EPSG:4326',
            'EPSG:3857'
          ),
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
    });
  }

  private getAddress(coord: Coordinate) {
    this.openRouteService.getStreetInformation(coord).subscribe({
      next: (response: any) => {

        // console.log(response.address);
        // console.log(response.address.road);

        let road = response.address.road;
        let neighbourhood = response.address.neighbourhood;
        let suburb = response.address.suburb;
        let city = response.address.city;
        let state = response.address.state;

        const address = `${road === undefined ? '' : road + ','} ${neighbourhood === undefined ? '' : neighbourhood + ','
          } ${city === undefined ? state : city}`;

        // const distance = response.features[0]?.properties?.distance;

        // console.log(response.features)
        this.address = address;
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
    });
  }
  // --------------------------------------------
  // --------------------------------------------
  // -- DRAW EN EL MAPA
  // --------------------------------------------
  // --------------------------------------------



  // --------------------------------------------
  // -- inicializar marcador en el mapa
  // --------------------------------------------
  public initMarker(
    coord: Coordinate,
    client: I_UserMap | I_DestinationMarker,
    type: string = ''
  ) {
    // Asegúrate de que el servicio y el mapa estén disponibles
    if (this.markerService && this.map) {
      // Buscar el índice del marcador que se va a actualizar
      const indexToUpdate = this.markers.findIndex(
        (marker) => marker.get('client').id === client.id
      );

      // -- el marcador NO existe en el array
      if (indexToUpdate === -1) {
        this.markers = this.markerService.initMarker(
          this.markers,
          coord,
          client
        );
      }
      // -- el marcador existe en el array
      else {
        this.markers = this.markerService.updateMarkers(
          this.markers,
          coord,
          client
        );

        // this.vectorSource.refresh();
      }

      this.updateMarkers();
    }
  }

  // -- Inicializa el marcador destino
  initMarkerDestination(coord: Coordinate) {
    let destination: I_DestinationMarker = {
      id: 'destination',
      name: '',
      markerColor: 'danger',
      currentPosition: {
        lat: coord[1],
        long: coord[0],
      }
    };

    this.initMarker(coord, destination);
  }

  updateMarkers(feature: Feature = new Feature()) {
    const vectorSource = new VectorSource({
      features: [feature],
    });

    vectorSource.addFeatures(this.markers);

    this.vectorLayer.getSource()?.clear();
    this.vectorLayer.getSource()?.refresh();

    this.vectorLayer = new VectorLayer({
      source: vectorSource,
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
      const indexToUpdate = this.markers.findIndex(
        (marker) => marker.get('client').id === clientId
      );

      // -- el marcador NO existe en el array
      if (indexToUpdate !== -1) {
        this.markers = this.markerService.removeMarker(this.markers, clientId);

        this.updateMarkers();
      } else {
        // this.clearMarker(clientId);
      }
    }
  }

  // Función para pintar marcadores para todos los usuarios conectados
  public setMarkersForConnectedUsers() {
    // Asegúrate de tener datos en connected_users y de que el servicio y el mapa estén disponibles
    if (
      this.connected_DriverUsers.length > 0 &&
      this.markerService &&
      this.map
    ) {
      this.connected_DriverUsers.forEach((user: I_UserMap) => {
        // Verifica si la posición actual está presente en el usuario antes de intentar pintar el marcador
        if (user.currentPosition.lat && user.currentPosition.long) {
          const coord: Coordinate = [
            user.currentPosition.long,
            user.currentPosition.lat,
          ];

          this.markers = this.markers.filter((marker) => {
            return this.connected_DriverUsers.some(
              (user) => user.id === marker.get('client').id
            );
          });

          this.initMarker(this.coord, this.client);

          let client: I_UserMap = {
            id: user.id,
            name: user.name,
            markerColor: 'warning',
            currentPosition: {
              lat: this.coord[1],
              long: this.coord[0]
            }
          };

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
