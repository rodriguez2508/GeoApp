import {
  Component, OnDestroy,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../../../environments/environment';


import { DataService } from '../../../services/data/data.service';
import { SessionService } from '../../../modules/session-module/services/session.service';
import { ShareAppService } from '../../../services/share-app.service';
import { StorageService } from '../../../services/storage/storage.service';
import { I_UserSessionStorage } from '../../../interface/user.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements AfterViewInit, OnDestroy, OnChanges {

  _role: string = 'undefined';
  client: any;

  userLoginOn: boolean = false;
  userData: I_UserSessionStorage = { id: '', user_name: '', user_type: '' };

  appVersion: string = environment.appVersion;
  appName: string = environment.appName;
  titleApp: string = this.appName + " | " + this.appVersion;

  isActive = false;

  pageInit: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private sessionService: SessionService,
    private shareappService: ShareAppService,
    private storageService: StorageService
  ) {

    this.route.queryParams.subscribe(params => {

    });

    console.log(this.client)


  }

  async ngOnInit(): Promise<void> {

    this.dataService.getUserData().subscribe((value) => {

      this.userData = value;

    });

    this.dataService.getUserLoggedIn().subscribe((value) => {

      this.userLoginOn = value;

    });

  }


  ngOnChanges(changes: SimpleChanges): void {

  }
  ngAfterViewInit() {


  }
  ngOnDestroy(): void {

  }



  // -----------------------------------------
  // F_ boton menu cuando la vista es telefono
  // -----------------------------------------
  toggleIcon() {


    this.isActive = !this.isActive;
    const headerElement = document.getElementById('header'); 
    if(headerElement != null)
    headerElement.style.height = this.isActive ? '100vh' : '8vh';
    
}



  // -----------------------------------------
  //  F_ eliminar datos de Sesion
  // -----------------------------------------

  async f_signOut() {

  const resultado = await this.dataService.showQuestion('¿Estás seguro de que deseas continuar?', 'warning', 'question');
  if (resultado) {

    // -- funcion para eliminar datos de la sesion
    this.sessionService.signout();

    // -- mostrar mensaje en la pantalla
    this.dataService.showMsjInData('Cerrando Sesión...', 'success', '/');

    // window.location.reload();

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

  if (!doc.fullscreenElement && !doc.fullscreenElement && !doc.fullscreenElement && !doc.fullscreenElement) {
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
      this.dataService.showMsj('Éxito!', 'Contenido compartido con éxito', 'success');

      console.log('Contenido compartido con éxito.')
    },
    () => console.error('Error al compartir el contenido.')
  );
}

  get role(): string | undefined {
  return this._role;
}
  
}
