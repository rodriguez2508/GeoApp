import { Coordinate } from "ol/coordinate";

export interface I_Marker {
  id: string;
  coord: Coordinate;
  
}

export interface I_DestinationMarker {
  id: string;
  name: string;
  markerColor:string;
  currentPosition: {
    long: number;
    lat: number;
  };
}