import { Coordinate } from "ol/coordinate";


export interface I_UserSessionStorage {
  id: string;
  ci: string;
  name: string;
  email: string;
  exp: number;
  iat: number;
  phone: string;
  type_user:string; 
}

export interface I_UserDrivers {
  drive(): boolean;
  pickUp(address: string): boolean;
  dropOff(address: string): boolean;
  getLocation(): Coordinate;
  getVehicleInfo(): any; // Función que devuelve información sobre el vehículo del usuario, como el modelo, año, matrícula,

  getPaymentInfo(): any; // Función que devuelve información sobre el método de pago preferido del usuario.

  acceptRequest(request: any): void; // Función que acepta una solicitud de viaje de un pasajero. Toma una solicitud de viaje como parámetro.

  rejectRequest(request: any): void; // Función que rechaza una solicitud de viaje de un pasajero. Toma una solicitud de viaje como parámetro.

  startTrip(request: any): void; // Función que indica que el usuario ha comenzado un viaje. Toma una solicitud de viaje como parámetro.

  endTrip(request: any): void; // Función que indica que el usuario ha terminado un viaje. Toma una solicitud de viaje como parámetro.
}

export interface I_UserTraveler {
  requestPickup(origin: string, destination: string): void; // Puedes ajustar los tipos de parámetros según tus necesidades
  cancelRequest(): void;
  getCurrentLocation(): Coordinate;
  getPaymentMethod(): any; // Puedes ajustar el tipo de retorno según tus necesidades
  rateDriver(rating: number): void;
  leaveFeedback(feedback: string): void;
}


export interface I_UserMap {
  id: string;
  name: string;
  markerColor:string;
  currentPosition: {
    long: number;
    lat: number;
  };
}

// export interface I_ConnectedUser {
//   id: string;
//   user: I_UserSessionStorage;
//   currentPosition: {
//     lat: number;
//     long: number;
//   };
// }