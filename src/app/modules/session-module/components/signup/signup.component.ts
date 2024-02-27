import { StorageService } from './../../../../services/storage/storage.service';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase/app'


// -- Interfaces
import { I_SignUp } from '../../../../interface/session.interface';
// -- Interfaces

// -- Services
import { SessionService } from '../../services/session.service';
import { DataService } from '../../../../services/data/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
// -- Services

declare var google: any;

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit, AfterViewInit {

  
  // ----------------------------------
  // -- Variables
  // ---------------------------------- 

  private _snackBar = inject(MatSnackBar)

  
  _role: string = 'undefined';

  title_page: string = "Registrarse";
  form_register: FormGroup;

  form: any = {
    user: null,
    ci: null,
    phone: null,
    email: null,
    code: null,
    password: null,
    password_rpt: null,
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  hide = true;
  // ----------------------------------
  // -- Variables
  // ---------------------------------- 

  constructor(
    private router:Router, private route: ActivatedRoute, 
    private fb: FormBuilder, private sessionService: SessionService, 
    private dataService: DataService,
    private storageService: StorageService,
    ) {

    this.route.queryParams.subscribe(params => {
      this._role = params['role'];
    });

    
    this.form_register = this.f_createForm();

  }

  // ----------------------------------
  // -- Se ejecuta al iniciar la pagina
  // ---------------------------------- 
  ngOnInit(): void {



  }

  ngAfterViewInit(): void {
 
  }

  onSubmit(): void {

    // -- llamar funcion iniciar sesion
    this.f_signup();
  }

  // ----------------------------------
  // -- crear el formulario Register
  // ----------------------------------  
  private f_createForm(): FormGroup {

    return this.fb.group({
      'user_type': ['traveler', [Validators.required]],
      'ci': ['', [Validators.required, Validators.minLength(11)]],
      'email': ['', [Validators.required, Validators.minLength(5)]],
      'name': ['', [Validators.required, Validators.minLength(5)]],
      'phone': ['', [Validators.required, Validators.minLength(5)]],
      'password': ['', [Validators.required, Validators.minLength(6)]],
      'password_rpt': ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // ----------------------------------
  // TODO funcion para registrarse sesion  
  // ---------------------------------- 
  f_signup() {
    // Tip: si los datos del formulario son incorrectos
    if (this.form_register.invalid) {
      this.form_register.markAllAsTouched();

      return;
    }

    this.sessionService.signup(this.form_register.value).subscribe({
      next: (response: any) => {

        // guardar sesion en Firebase
        this.f_signupFirebase();

        if(response.type_user == 'traveler') return this.goToTravelerView();
        else if(response.type_user == 'driver') return this.goToDriverView();
        else if(response.type_user == 'admin') return this.goToTravelerView();
  
        return;
      },
      error: (error: any) => {
        
        this.dataService.showMsj('Ha ocurrido un error.' ,'Warning', 'warning');
        console.error('Error getting Registrarse:', error);
 
      },
      complete: () => {
        // Realizar acciones adicionales cuando el observable se completa, si es necesario
      },
    });
     

  } 

  registerWithGoogle(router:any, auth: any, response:any) {
    // console.log('Encoded JWT ID token: ' + response.credential);
    let token= "";
    if (response.credential) {
      auth.f_setToken(response.credential);
      
      // sessionStorage.setItem('token', response.credential);
      router.navigateByUrl('private/inicio');
      // document.location.href = 'http://localhost:4200/#/private/inicio';
    }
 
  }

  
  
  async f_signupFirebase(){

    // Tip: si los datos del formulario son incorrectos
    if (this.form_register.invalid) {
      this.form_register.markAllAsTouched();

      const config = this.dataService.openSnackBar('warning');
      const snackBarRef = this._snackBar.open('verifique el formulario', 'CLOSE', config ); 
   
      snackBarRef.afterDismissed().subscribe(() => {
        
        return;

      });

    } 

    const credentials = {
      email: this.form_register.value.user_name,
      password: this.form_register.value.password
    }

    try{
      await this.sessionService.signupWithFirebase(credentials); 
      
    }catch (error){
      console.log(error)
    }
  }
 


  goToTravelerView() {
     
   return this.router.navigate(['/traveler/travel-request'], { 
      queryParams: {
         
      },
    });
  }
  goToDriverView() {
    
    return this.router.navigate(['/traveler/travel-request'], { 
      queryParams: {
         
      },
    });
  }  
  goToSignIn() {
    return this.router.navigate(['/session/signin'], { queryParams: { role: '' } });
  }

  // ----------------------------------
  // -- para obtener el valor de los campos del form
  // ---------------------------------- 

  public get f(): any {

    return this.form_register.controls;
  }

}
