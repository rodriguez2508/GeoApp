import { provideAuth } from '@angular/fire/auth';
import { StorageService } from './../../../../services/storage/storage.service';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';

import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseApp } from '@angular/fire/app';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { SessionService } from '../../../../services/session/session.service';
import { DataService } from '../../../../services/data/data.service';
import { I_UserSessionStorage } from '../../../../interface/user.interface';
import { I_SignIn, I_SignInGoogle } from '../../../../interface/session.interface';
import { environment } from '../../../../../environments/environment';


// ----------------------------------
// -- Variables Globales
// ---------------------------------- 

declare let google: any;

// ----------------------------------
// -- Variables Globales
// ---------------------------------- 


@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent implements OnInit, AfterViewInit {

  // ----------------------------------
  // -- Variables
  // ---------------------------------- 

  private _snackBar = inject(MatSnackBar)

  _role: string = 'undefined';

  title_page: string = "Iniciar Sesión";
  form_login: FormGroup;

  form: any = {
    username: null,
    email: null,
    password: null
  };
  isProccesing = false;
  isSignUpFailed = false;
  errorMessage = '';
  hide = true;
  // ----------------------------------
  // -- Variables
  // ---------------------------------- 

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private sessionService: SessionService,
    private dataService: DataService,
    private storageService: StorageService,
    private afAuth: FirebaseApp
  ) {

    this.route.queryParams.subscribe(params => {
      this._role = params['role'];
    });

    this.form_login = this.f_createLoginForm();

  }

  ngOnInit(): void {


  }

  ngAfterViewInit(): void {

    //  iniciar sesion google
    this.f_init_signinGoogle();

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
      
      'user_type': ['traveler', [Validators.required]],
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


      const config = this.dataService.openSnackBar('warning');
      this._snackBar.open('Verifique el formulario', 'CLOSE', config);

      return;
    }

    // this.dataService.showMsjInData('procesando..', 'warning', '');

    this.sessionService.signin(this.form_login.value).subscribe({
      next: (data: any) => {

        // -- mostrar mensaje en la pantalla
        // this.dataService.showMsjInData('Credenciales Verificadas, espere ...', 'success', '');

        const config = this.dataService.openSnackBar('success');
        const snackBarRef = this._snackBar.open('Credenciales verificadas, espere..', 'CLOSE', config);

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
        this._snackBar.open('Credenciales Incorrectas', 'CLOSE', config);

      },
      complete: () => {

      },
    });

  }

  // ------------------------------------------
  // TODO para iniciar sesion con goolge
  // ------------------------------------------

  f_signin_google(email: string) {
    // Tip: si los datos del formulario son incorrectos
    if (email) {

      const user_type = this.form_login.value.user_type;

      this.sessionService.signin_google({user: email, user_type}).subscribe({
        next: (data: any) => {


          const config = this.dataService.openSnackBar('success');
          const snackBarRef = this._snackBar.open('Credenciales verificadas, espere..', 'CLOSE', config);

          snackBarRef.afterDismissed().subscribe(() => {


            const user = this.storageService.decodeToken(data.token);
            // const user = this.storageService.getUser();
            console.log(user)
            if (user.user_type == 'traveler') this.reloadComponent(false, '/traveler/travel-request');
            else if (user.user_type == 'driver') this.reloadComponent(false, '/driver/offers-request');
            else if (user.user_type == 'admin') this.reloadComponent(false, '/traveler/travel-request');


          });



        },
        error: (errorData) => {

          console.log(errorData)

          const config = this.dataService.openSnackBar('warning');
          this._snackBar.open('Credenciales incorrectas.', 'CLOSE', config);


          // this.dataService.showMsj('Credenciales Incorrectas', 'Alert', 'error');
        },
        complete: () => {

        },
      });
    }
    return;

  }

  async f_init_signinGoogle() {


    google.accounts.id.initialize({
      client_id: environment.client_google_auth,
      callback: (this.handleCredentialResponse.bind(this)),
    });
    google.accounts.id.renderButton(
      document.getElementById('btn_LoginGoogle'),
      { theme: 'filled_blue', size: 'medium' } // customization attributes
    );
    google.accounts.id.prompt(); // also display the One Tap dialog

  }


  // Tip: Login con google
  handleCredentialResponse(response: any) {

    console.log('Encoded JWT ID token: ' + response.credential);
    const token = response.credential;


    const config = this.dataService.openSnackBar('success');
    this._snackBar.open('Estamos verificando credenciales, espere..', 'CLOSE', config);

    // guardar token en sessionstorage
    this.storageService.f_setToken(token, 'token_google');

    if (token) {

      // -- decodificar token

      const data = this.storageService.decodeToken(token);

      // -- obtener email 

      if (data.email_verified) {


        // -- verificar credenciales
        this.f_signin_google(data.email);

      }

    }


  }

  // ------------------------------------------
  // para iniciar sesion con goolge
  // ------------------------------------------

  async f_signinFirebase() {

    // Tip: si los datos del formulario son incorrectos
    if (this.form_login.invalid) {
      this.form_login.markAllAsTouched();

      const config = this.dataService.openSnackBar('warning');
      this._snackBar.open('verifique el formulario', 'CLOSE', config);

      return;
    }

    const credentials = {
      email: this.form_login.value.user_name,
      password: this.form_login.value.password
    }

    try {
      await this.sessionService.signupWithFirebase(credentials);

      // this.f_signin();


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
  // -----------------------------
  // TODO 
  // -----------------------------
  goToSignUp(): void {
    this.router.navigate(['/session/signup'], { queryParams: { role: '' } });
  }

  showPassword() {
    this.hide = !this.hide;
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
