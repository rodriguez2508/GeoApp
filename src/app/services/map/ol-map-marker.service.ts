import { Injectable } from '@angular/core';

// -- ol map
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { Coordinate } from 'ol/coordinate';
import { fromLonLat } from 'ol/proj';  
// -- ol map
// -- interfaces
import { I_UserMap } from '../../interface/user.interface';
// -- interfaces

// --- CONSTANT 
import { DEFAULT_ANCHOR, DEFAULT_ICON, DEFAULT_LAT, DEFAULT_LON, DEFAULT_TEXT, MARKER_COLOR } from '../../modules/traveler/data/data-map';
// --- CONSTANT

@Injectable({
  providedIn: 'root'
})
export class OlMapMarkerService {


  //--- 
  // Crear los marcadores
  marker: any;
  markers: Feature[] = [];

  // ---


  lat: number = DEFAULT_LAT;
  lon: number = DEFAULT_LON;
  anchor: number[] = DEFAULT_ANCHOR;
  icon: string = DEFAULT_ICON;
  text: string = DEFAULT_TEXT;

  private vectorSource = new VectorSource();
  private vectorLayer = new VectorLayer({
    source: this.vectorSource,
  });
  constructor() {
  }


  // --------------------------------------------
  // -- Inicializar marcador en el mapa 
  // --------------------------------------------
  initMarker(markers: Feature[], coord: Coordinate,
    client: I_UserMap): Feature[] {

    // Buscar el índice del marcador 
    const indexToUpdate = markers.findIndex(marker => marker.get('client').id === client.id);

    if (indexToUpdate !== -1) {
      return markers;
    }

    // Crear un nuevo Feature con la geometría Point en las coordenadas especificadas
    const marker = new Feature({
      geometry: new Point(fromLonLat(coord)),
      client: client,
      type: 'data', // ¿Es necesario tener un tipo aquí?
    });


    const markerText = new Feature({
      geometry: new Point(fromLonLat(coord)),
      client: client,
      type: 'text', // ¿Es necesario tener un tipo aquí?
    });

    // // Crear una segunda feature para la sombra
    // const shadow = new Feature({
    //   geometry: new Point(fromLonLat(coord)),
    //   client: client,
    //   type: 'shadow', // ¿Es necesario tener un tipo aquí?
    // });

    // Crear un estilo base para el círculo
    const baseStyle = new Style({
      image: new Icon({
        color: MARKER_COLOR[client.markerColor],
        crossOrigin: 'anonymous',
        src: this.icon, // Asegúrate de tener 'this.icon' definido anteriormente
        size: [20, 20],
      }),
    });

    const text = new Style({
      text: new Text({
        text: client.user_name,
        font: 'bold 17px arial',
        offsetY: 20,
        offsetX: 10,
        fill: new Fill({ color: 'rgb(10,0,0)' }),
        stroke: new Stroke({ color: 'rgb(255,255,255)', width: 10 }),
      }),
    });

    markerText.setStyle(text);
    marker.setStyle(baseStyle);

    // Agregar las features al array de marcadores
    markers.push(marker);
    markers.push(markerText);
    // markers.push(shadow);

    return markers;
  }


  // --------------------------------------------
  // -- Actualizar marcador en el mapa 
  // --------------------------------------------
  public updateMarkers(markers: Feature[], coord: Coordinate, client: I_UserMap): Feature[] {

    // Buscar el índice del marcador que se va a actualizar
    const indexToUpdate = markers.findIndex(marker => marker.get('client').id === client.id);

    if (indexToUpdate === -1) {


      return this.initMarker(markers, coord, client);
    }


    // Recorrer el array de marcadores y actualizar solo el marcador específico
    markers = markers.map(marker => {

      if (marker.get('client').id === client.id && marker.get('type') == 'data') {

        // Actualizar el estilo base según el estado del cliente
        const baseStyle = new Style({
          image: new Icon({
            color: MARKER_COLOR[client.markerColor],
            crossOrigin: 'anonymous',
            src: this.icon,
            size: [20, 20],
          }),
        });

        marker.setGeometry(new Point(fromLonLat(coord)));
        marker.setStyle(baseStyle);

        return marker;

      }
      else if (marker.get('client').id === client.id && marker.get('type') == 'text') {

        const text = new Style({
          text: new Text({
            text: client.user_name,
            font: 'bold 17px arial',
            offsetY: 20,
            offsetX: 10,
            fill: new Fill({ color: 'rgb(10,0,0)' }),
            stroke: new Stroke({ color: 'rgb(255,255,255)', width: 10 }),
          }),
        });

        marker.setGeometry(new Point(fromLonLat(coord)));
        marker.setStyle(text);

        return marker;

      }
      return marker;
    });

    return markers;

  }


  findMarker(markers: Feature[], client: I_UserMap): Feature {

    // Buscar el índice del marcador que se va a actualizar
    const indexToUpdate = markers.findIndex(marker => marker.get('client').id === client.id);

    if (indexToUpdate === -1) {
      return new Feature();
    }

    return markers[indexToUpdate];
  }

  removeMarker(markers: Feature[], clientId: string): Feature[] {

    // Buscar el índice del marcador que se va a actualizar
    const indexToRemove = markers.findIndex(marker => marker.get('client').id === clientId && marker.get('type') == 'data');
    if (indexToRemove !== -1) markers.splice(indexToRemove, 1); 


    const indexToRemove_text = markers.findIndex(marker => marker.get('client').id === clientId && marker.get('type') == 'text');
    if (indexToRemove_text !== -1) markers.splice(indexToRemove_text, 1); 
    // if (indexToRemove_text !== -1) 


    return markers;

  }


}
