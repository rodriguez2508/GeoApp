// ------------
// --Interfaz para usuario que inicia sesion
// ------------

export interface I_Places {

  coordinates:string,
  name:string,
  address:string
  
}

export interface I_Places_db {

  coordinates:string,
  address:string,
  id?:string,
  name:string,
  user_id:string
  
}
 