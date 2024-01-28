import { Injectable } from '@angular/core';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import * as Proj from 'ol/proj';
import Map from 'ol/Map';
import { Coordinate } from 'ol/coordinate';



// --- personal import
import { Client } from '../../interface/client.interface';
import { fromLonLat } from 'ol/proj';
import { Overlay } from 'ol';
// --- personal import

// --- CONSTANT
export const DEFAULT_LAT = 23.0415;
export const DEFAULT_LON = -81.5775;

export const DEFAULT_ANCHOR = [0.5, 1];
export const DEFAULT_TEXT = '';

const MARKER_COLOR: { [key: string]: number[] } = {
  'success': [53, 140, 0, 1],
  'warning': [127, 214, 127, 0.5],
  'danger': [255, 0, 0, 1],
  'info': [127, 255, 127, 0.5],
  'transparent': [255, 255, 255, 0],
};
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
  icon: string = 'assets/img/dot.png';
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
    client: Client): Feature[] {

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

    // Crear una segunda feature para la sombra
    const shadow = new Feature({
      geometry: new Point(fromLonLat(coord)),
      client: client,
      type: 'shadow', // ¿Es necesario tener un tipo aquí?
    });

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
        text: client.name,
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
    markers.push(shadow);

    return markers;
  }


  // --------------------------------------------
  // -- Actualizar marcador en el mapa 
  // --------------------------------------------
  public updateMarkers(markers: Feature[], coord: Coordinate, client: Client): Feature[] {

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
            text: client.name,
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
      else if (marker.get('client').id === client.id && marker.get('type') == 'shadow') {

        marker.setGeometry(new Point(fromLonLat(coord)));
        // marker.setStyle(baseStyle);


        return marker;

      }
      return marker;
    });

    return markers;

  }


  findMarker(markers: Feature[], client: Client): Feature {

    // Buscar el índice del marcador que se va a actualizar
    const indexToUpdate = markers.findIndex(marker => marker.get('client').id === client.id);

    if (indexToUpdate === -1) {
      return new Feature();
    }

    return markers[indexToUpdate];
  }


}
