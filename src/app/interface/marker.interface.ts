import { Coordinate } from "ol/coordinate";

export interface I_Marker {
  id: string;
  coord: Coordinate;
  
}

export interface I_DestinationMarker {
  id: string;
  user_name: string;
  markerColor: string;
}