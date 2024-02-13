import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { OlMapComponent } from '../ol-map/ol-map.component';
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
 
export const DEFAULT_LAT = 23.0415;
export const DEFAULT_LON = -81.5775;

export const DEFAULT_ANCHOR = [0.5, 1];
export const DEFAULT_ICON = 'assets/img/dot.png';
export const DEFAULT_TEXT = '';

const MARKER_COLOR: { [key: string]: number[] } = {
  success: [53, 140, 0, 1],
  warning: [127, 214, 127, 0.5],
  danger: [255, 0, 0, 1],
  info: [127, 255, 127, 0.5],
  transparent: [255, 255, 255, 0],
};


@Component({
  selector: 'app-ol-map-marker',
  standalone: true,
  imports: [],
  templateUrl: './ol-map-marker.component.html',
  styleUrl: './ol-map-marker.component.scss'
})
export class OlMapMarkerComponent implements OnInit, OnDestroy {
  
  
  @Input() lat: number = DEFAULT_LAT;
  @Input() lon: number = DEFAULT_LON;
  @Input() anchor: number[] = DEFAULT_ANCHOR;
  @Input() icon: string = DEFAULT_ICON;
  @Input() text: string = DEFAULT_TEXT;

  constructor(private olMap: OlMapComponent) { }

  ngOnInit(): void {
    const marker = new Feature({
      geometry: new Point(Proj.fromLonLat([this.lon, this.lat]))
    });
    const markerText = new Feature({
      geometry: new Point(Proj.fromLonLat([this.lon, this.lat]))
    });

    const icon = new Style({ 
      image: new Icon({
        color: MARKER_COLOR['transparent'],
        anchor: this.anchor,
        crossOrigin: 'anonymous',
        src: 'assets/img/dot.png',
      }),

    });

    const text = new Style({
      text: new Text({
        text: this.text,
        font: 'bold 12px arial',
        offsetY: 8,
        fill: new Fill({color: 'rgb(0,0,0)'}),
        stroke: new Stroke({color: 'rgb(255,255,255)', width: 1})
      })
    });

    marker.setStyle(icon);
    markerText.setStyle(text);

    const vectorSource = new VectorSource({
        features: [marker, markerText]
    });

    const vectorLayer = new VectorLayer({
        source: vectorSource
    });

    vectorLayer.setZIndex(10);

    if (this.olMap.map) {
      // this.olMap.setMarker(vectorLayer);
    } else {
      setTimeout(() => {
        this.ngOnInit();
      }, 10);
    }
  }

  ngOnDestroy() {}


}
