import { StorageService } from './../../../../services/storage/storage.service';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as firebase from 'firebase/app'


// -- Interfaces
import { I_SignUp } from '../../../../interface/session.interface';
// -- Interfaces

// -- Services
import { SessionService } from '../../../../services/session/session.service';
import { DataService } from '../../../../services/data/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../../environments/environment';
import { switchMap } from 'rxjs';
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
    private router: Router, private route: ActivatedRoute,
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

    this.f_init_signinGoogle();
  }

  async onSubmit(): Promise<void> {


    // Tip: si los datos del formulario son incorrectos
    if (this.form_register.invalid) {
      this.form_register.markAllAsTouched();

      return;
    }
    if (await this.dataService.showQuestion(`Está seguro de haber elegido el tipo de usuario correcto? ${this.form_register.value.user_type == 'traveler' ? 'Viajero' : this.form_register.value.user_type == 'driver' ? 'Conductor' : 'Administrador'}`, this.form_register.value.user_type, 'warning')) {
      // -- llamar funcion iniciar sesion
      this.f_signup();
    }
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
  
    this.sessionService.signup(this.form_register.value).subscribe({
      next: (response: any) => {

        // const config = this.dataService.openSnackBar('success');
        // const snackBarRef = this._snackBar.open('Se ha completado su petición, espere..', 'CLOSE', config);
        // snackBarRef.afterDismissed().subscribe(() => {

           

        // });

        this.f_signin();
        
      },
      error: (error: any) => {

        const config = this.dataService.openSnackBar('success');
        const snackBarRef = this._snackBar.open('No se pudo realizar su solicitud.', 'CLOSE', config);

        
        console.error('Error getting Registrarse:', error);

      },
      complete: () => {
        
        ;
        // Realizar acciones adicionales cuando el observable se completa, si es necesario
      },
    });


  }

  f_signin() {
    // Tip: si los datos del formulario son incorrectos
     
    const userData: {
      user_type: string,
      user_name: string,
      password: string,
    } = {
      user_type: this.form_register.value.user_type,
      user_name: this.form_register.value.email,
      password: this.form_register.value.password,
    };

    // this.dataService.showMsjInData('procesando..', 'warning', '');

    this.sessionService.signin(userData).subscribe({
      next: (data: any) => {

        // -- mostrar mensaje en la pantalla
        // this.dataService.showMsjInData('Credenciales Verificadas, espere ...', 'success', '');

        const config = this.dataService.openSnackBar('success');
        const snackBarRef = this._snackBar.open('Se ha completado su petición, espere..', 'CLOSE', config);

        snackBarRef.afterDismissed().subscribe(() => {


          const user = this.storageService.decodeToken(data.token);
          // const user = this.storageService.getUser();
          // console.log(user)

          if (user.user_type == 'traveler') this.reloadComponent(false, '/traveler/travel-request');
          else if (user.user_type == 'driver') this.reloadComponent(false, '/driver/offers-request');
          else if (user.user_type == 'admin') this.reloadComponent(true);


        });



      },
      error: (errorData) => {

        console.log(errorData)

        const config = this.dataService.openSnackBar('danger');
        this._snackBar.open('Ha ocurrido un error al iniciar la sesión, dirígase a la sección Iniciar sesión e introduzca sus datos.', 'CLOSE', config);

      },
      complete: () => {

      },
    });

  }

  // ------------------------------------------
  // TODO para iniciar sesion con goolge
  // ------------------------------------------


  async f_init_signinGoogle() {


    google.accounts.id.initialize({
      client_id: environment.client_google_auth,
      callback: (this.handleCredentialResponse.bind(this)),
    });
    google.accounts.id.renderButton(
      document.getElementById('btn_SignUpGoogle'),
      { theme: 'filled_blue', size: 'medium' } // customization attributes
    );
    google.accounts.id.prompt(); // also display the One Tap dialog

  }


  // Tip: Login con google
  handleCredentialResponse(response: any) {


    // console.log('Encoded JWT ID token: ' + response.credential);
    const token = response.credential;

    // guardar token en sessionstorage
    this.storageService.f_setToken(token, 'token_google');

    if (token) {

      // -- decodificar token

      const data = this.storageService.decodeToken(token);
      // console.log('Decoded JWT ID token: ', data);
      // -- obtener email 

      if (data.email_verified) {


        const dataUserGoogle = {
          name: data.name,
          email: data.email,
          phone: data.phone ? data.phone : '',
        };

        // -- Actualizar el formulario
        this.f.name.setValue(dataUserGoogle.name);
        this.f.email.setValue(dataUserGoogle.email);
        this.f.phone.setValue(dataUserGoogle.phone); 
        
        this.dataService.showMsj('Su información se ha completado, verifique los campos que faltan.', 'Verificación completada.', 'success');

        this.onSubmit(); 

      }

    }
  }

  // ------------------------------------------
  // para iniciar sesion con goolge
  // ------------------------------------------


  async f_signupFirebase() {

    // Tip: si los datos del formulario son incorrectos
    if (this.form_register.invalid) {
      this.form_register.markAllAsTouched();

      const config = this.dataService.openSnackBar('warning');
      const snackBarRef = this._snackBar.open('verifique el formulario', 'CLOSE', config);

      snackBarRef.afterDismissed().subscribe(() => {

        return;

      });

    }

    const credentials = {
      email: this.form_register.value.user_name,
      password: this.form_register.value.password
    }

    try {
      await this.sessionService.signupWithFirebase(credentials);

    } catch (error) {
      console.log(error)
    }
  }



   // TODO ---------------------------------------
  // -- recarga el componente o redirige a otra ruta
  // 
  reloadComponent(self: boolean, urlToNavegateTo?: string) {

    //
    console.log('Ruta actual', this.router.url);
    const url = self ? this.router.url : urlToNavegateTo;

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {

      this.router.navigate([`/${url}`]).then(() => {

        window.location.reload();
        console.log('Ruta despues de la navegacion', this.router.url);

      });
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
