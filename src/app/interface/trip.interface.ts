// ------------
// --Interfaz para usuario que inicia sesion
// ------------

    // "origin_coordinate": "0,0",
    // "destination_coordinate": "0,0",
    // "destination_address": "some",
    // "origin_address": "sdada",
    // "status": "asdas",  
    // "driver_id": "asdas",   
    // "traveler_id": "67e900c9-1240-4e4d-80d5-aa8f9e018934",
    // "vehicleType": "1",
    // "personNumber": "string", 
    // "maxTimeWaiting": "15",
    // "travelPeferences": "" 

export interface I_FormTravelRequest {

    id?: string;
    origin_coordinate: string;
    destination_coordinate: string; 
    origin_address: string; 
    destination_address: string; 
    status: string; 
    driver_id?: string; 
    traveler_id: string; 

    vehicleType?: string; 
    personNumber: string; 
    maxTimeWaiting: string; 
    travelPeferences: string; 
    dateCreated?: Date; 
  }
   