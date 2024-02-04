import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';


// -- Interfaces
import { I_SignUp } from '../../../../interface/session.interface';
// -- Interfaces

// -- Services
import { SessionService } from '../../services/session.service';
import { DataService } from '../../../../services/data.service';
// -- Services

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

  // ----------------------------------
  // -- Variables
  // ---------------------------------- 

  constructor(private router:Router, private route: ActivatedRoute, private fb: FormBuilder, private sessionService: SessionService, private dataService: DataService) {

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
      'user_type': [this._role, [Validators.required]],
      'ci': ['', [Validators.required, Validators.minLength(11)]],
      'email': ['', [Validators.required, Validators.minLength(5)]],
      'name': ['', [Validators.required, Validators.minLength(5)]],
      'phone': ['', [Validators.required, Validators.minLength(5)]],
      'code': ['', [Validators.required, Validators.minLength(5)]],
      'password': ['', [Validators.required, Validators.minLength(6)]],
      'password_rpt': ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // ----------------------------------
  // -- funcion para registrarse sesion  
  // ---------------------------------- 
  f_signup() {
    // Tip: si los datos del formulario son incorrectos
    if (this.form_register.invalid) {
      this.form_register.markAllAsTouched();

      return;
    }

    if (this.sessionService.isAuthenticated()) {
      // -- mostrar mensaje en la pantalla
      this.dataService.showMsjInData('Ya existe una sesión abierta en este navegador, asegúrese de que sea de usted.', 'success', '');
    }
    else if (this.sessionService.signup(this.form_register.value)) {

      // -- mostrar mensaje en la pantalla
      this.dataService.showMsjInData('Credenciales verificadas correctamente.', 'success', '/map/show');

    } else {

      // -- mostrar mensaje en la pantalla
      this.dataService.showMsjInData('Credenciales incorrectas!', 'danger', '');

    }

  }





  goToSignIn(): void {
    this.router.navigate(['/session/signin'], { queryParams: { role: '' } });
  }

  // ----------------------------------
  // -- para obtener el valor de los campos del form
  // ---------------------------------- 

  public get f(): any {

    return this.form_register.controls;
  }

}
