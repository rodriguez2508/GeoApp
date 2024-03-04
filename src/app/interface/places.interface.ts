// ------------
// --Interfaz para usuario que inicia sesion
// ------------

export interface I_Places {

  coordinates:string,
  name:string,
  description:string
  
}
export interface I_Places_db {

  user_ci:string,
  placeData:I_Places
    
}