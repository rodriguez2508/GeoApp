import {
  Component,
  OnDestroy,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';


import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { environment } from '../../../../environments/environment';

import { DataService } from '../../../services/data/data.service';
import { SessionService } from '../../../services/session/session.service';
import { ShareAppService } from '../../../services/share-app.service';
import { I_UserSessionStorage } from '../../../interface/user.interface';
import { NavbarTravelerComponent } from '../../../modules/traveler/components/shared/navbar/navbar-traveler.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LogUpdateService } from '../../../services/workers/log-update.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NavbarTravelerComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements AfterViewInit, OnDestroy, OnChanges {
  _role: string = 'undefined';
  client: any;


  private _snackBar = inject(MatSnackBar)

  @Input() userLoginOn: boolean = false;
  @Input() userData: I_UserSessionStorage = {
    id: '',
    ci: '',
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone: '',
    user_type: ''
  };

  rating: number = 0.0;
  rating_start: number[] = [0, 1, 0, 0, 0];
  appVersion: string = environment.appVersion;
  appName: string = environment.appName;
  titleApp: string = this.appName + ' | ' + this.appVersion;

  isActive = false;
  updateAvailable = false;
  pageInit: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private sessionService: SessionService,
    private shareappService: ShareAppService,
    private ws: LogUpdateService
  ) {
    this.route.queryParams.subscribe((params) => { });



  }

  async ngOnInit(): Promise<void> {
 
    


  }

  ngOnChanges(changes: SimpleChanges): void { }
  ngAfterViewInit() { 

    this.checkForUpdates();

  }
  ngOnDestroy(): void { }


  checkForUpdates(): void {
    this.ws.checkForUpdates().subscribe(updateFound => {
      
      if (updateFound) {
        // Código para instalar la actualización
        this.updateAvailable = updateFound;
      }

    });
  }

  activateUpdate(): void {
    this.ws.activateUpdate().then(activateUpdate => {
      
      if (activateUpdate) {
        // Código para instalar la actualización
        this.reloadWithUpdates();        
      }

    });
  }

  // -----------------------------------------
  // F_ boton menu cuando la vista es telefono
  // -----------------------------------------
  toggleIcon() {
    this.isActive = !this.isActive;
    const headerElement = document.getElementById('header');
    const headerElement_ = document.getElementById('header_');
    if (headerElement != null) {
      headerElement.style.height = this.isActive ? '100vh' : '8vh';
    }
    if (headerElement_ != null) {
      headerElement_.style.display = this.isActive ? 'none' : '';
    }
  }

  // -----------------------------------------
  //  F_ eliminar datos de Sesion
  // -----------------------------------------

  async f_signOut() {
    const resultado = await this.dataService.showQuestion(
      '¿Estás seguro de que deseas continuar?',
      'warning',
      'question'
    );
    if (resultado) {
      // -- funcion para eliminar datos de la sesion
      this.sessionService.signout();

      // -- mostrar mensaje en la pantalla
      // this.dataService.showMsjInData('Cerrando Sesión...', 'success', '/session/login');

      const config = this.dataService.openSnackBar('success');
      const snackBarRef = this._snackBar.open('Cerrando Sesión...', 'CLOSE', config);

      snackBarRef.afterDismissed().subscribe(() => {

        this.goToTravelerLogin();
      });
    } else {
      // Hacer algo si se cancela
    }
  }

  // -----------------------------------------
  //  F_ para abrir a pantalla completa la aplicacion
  // -----------------------------------------
  async toggleFullscreen() {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullScreen = docEl.requestFullscreen;
    const cancelFullScreen = doc.exitFullscreen;

    if (
      !doc.fullscreenElement
    ) {
      requestFullScreen.call(docEl);
    } else {
      cancelFullScreen.call(doc);
    }
  }

  // -----------------------------------------
  //  F_ para abrir a pantalla completa la aplicacion
  // -----------------------------------------
  shareApp(platform: string) {
    this.shareappService.compartir().then(
      () => {
        // -- mostrar mensaje en la pantalla
        // this.dataService.showMsj(
        //   'Éxito!',
        //   'Contenido compartido con éxito',
        //   'success'
        // );

        const config = this.dataService.openSnackBar('success');
        this._snackBar.open('Contenido compartido con éxito.', 'CLOSE', config);

        console.log('Contenido compartido con éxito.');
      },
      () => {
        // const config = this.dataService.openSnackBar('success');
        // this._snackBar.open('Error al compartir el contenido.', 'CLOSE', config);
        // console.error('Error al compartir el contenido.')
      }
    );
  }

  goToTravelerLogin(): void {
    this.router.navigate(['/session/signin'], {
      queryParams: {
        role: 'traveler',
      },
    });
  }

  reload() {
    document.location.reload();
  }

  reloadWithUpdates(){
    window.location.reload();
  }


  get role(): string | undefined {
    return this._role;
  }
}
