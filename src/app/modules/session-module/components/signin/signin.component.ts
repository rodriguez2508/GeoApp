import { StorageService } from './../../../../services/storage/storage.service';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';

import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


import { SessionService } from '../../services/session.service';
import { DataService } from '../../../../services/data/data.service';
import { I_UserSessionStorage } from '../../../../interface/user.interface';


// ----------------------------------
// -- Variables Globales
// ---------------------------------- 

// declare var google: any;

// ----------------------------------
// -- Variables Globales
// ---------------------------------- 


@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent implements OnInit, AfterViewInit {

  // ----------------------------------
  // -- Variables
  // ---------------------------------- 


  _role: string = 'undefined';

  title_page: string = "Iniciar Sesión";
  form_login: FormGroup;

  form: any = {
    username: null,
    email: null,
    password: null
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  // ----------------------------------
  // -- Variables
  // ---------------------------------- 

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private sessionService: SessionService, private dataService: DataService, private storageService:StorageService) {

    this.route.queryParams.subscribe(params => {
      this._role = params['role'];
    });

    this.form_login = this.f_createLoginForm();

  }

  ngOnInit(): void {


  }

  ngAfterViewInit(): void {

  }

  onSubmit(): void {

    // -- llamar funcion iniciar sesion
    this.f_signin();
  }

  // ----------------------------------
  // -- crear el formulario Login
  // ----------------------------------  
  private f_createLoginForm(): FormGroup {
    return this.fb.group({
      // 'user_type': [this._role === undefined ? 'traveler' : this._role, [Validators.required]],
      'user_name': ['', [Validators.required, Validators.minLength(3)]],
      'password': ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // ----------------------------------
  // -- funcion para iniciar sesion  
  // ---------------------------------- 
  f_signin() {
    // Tip: si los datos del formulario son incorrectos
    if (this.form_login.invalid) {
      this.form_login.markAllAsTouched();

      return;
    } 
    
    // const user: I_UserSessionStorage = this.storageService.getUser();


    this.sessionService.signin(this.form_login.value).subscribe({
      next: (data: any) => {
 
        // -- mostrar mensaje en la pantalla
        this.dataService.showMsjInData('Credenciales Verificadas, espere ...', 'success', '');
        
         
        const user = this.storageService.decodeToken(data.token);
        // const user = this.storageService.getUser();
        console.log(user)
        if(user.type_user == 'traveler') this.goToTravelerView();
        else if(user.type_user == 'driver') this.goToDriverView();
        else if(user.type_user == 'admin') this.goToTravelerView();
  
      },
      error: (errorData) => {

        console.log(errorData)
        
        this.dataService.showMsj('Credenciales Incorrectas!', 'Warning', 'warning');
      },
      complete: () => {
        
      },
    }); 

  }

  goToTravelerView(): void {
     
    this.router.navigate(['/traveler/travel-request'], { 
      queryParams: {
         
      },
    });
  }
  goToDriverView(): void {
    
    this.router.navigate(['/traveler/travel-request'], { 
      queryParams: {
         
      },
    });
  }  
  // -----------------------------
  // TODO 
  // -----------------------------
  goToSignUp(): void {
    this.router.navigate(['/session/signup'], { queryParams: { role: '' } });
  }


  // ----------------------------------
  // -- para obtener el valor de los campos del form
  // ---------------------------------- 

  public get f(): any {

    return this.form_login.controls;
  }

  get role(): string | undefined {
    return this._role;
  }

}
