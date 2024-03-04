// ------------
// --Interfaz para usuario que inicia sesion
// ------------



export interface I_FormTravelRequest {
    placeOrigin: string;
    placeDestination: string; 
    vehicleType: string; 
    personNumber: number; 
    maxTimeWaiting: number; 
    travelPeferences: string; 
  }
   