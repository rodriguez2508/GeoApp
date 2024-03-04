// ------------
// --Interfaz para usuario que inicia sesion
// ------------

export interface I_SignInGoogle { 
  user: string;
  password: string; 
}


export interface I_SignIn { 
    user_name: string;
    password: string; 
    user_type:string;
  }
  
  // ------------
  // --Interfaz para usuario que se registra 
  // ------------
  export interface I_SignUp {
    user_type:string;
    name: string;
    ci: string;
    phone: string;
    email: string;
    code: string;
    password: string;
    password_rpt: string;
  }
   