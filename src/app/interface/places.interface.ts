// ------------
// --Interfaz para usuario que inicia sesion
// ------------

export interface I_Places {

  coordinates:string,
  name:string,
  description:string
  
}

export interface I_Places_ {

  coordinates:string,
  description:string,
  id:string,
  name:string,
  user_id:string
  
}


export interface I_Places_db {

  user_id:string,
  placeData:I_Places
    
}