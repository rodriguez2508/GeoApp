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


import { DataService } from '../../../services/data.service';
import { SessionService } from '../../../modules/session-module/services/session.service';
import { ShareAppService } from '../../../services/share-app.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements AfterViewInit, OnDestroy, OnChanges {

  datosUsuario: any;
  userLoginOn: boolean = false;
 
  appVersion:string = environment.appVersion;
  appName:string = environment.appName;
  titleApp: string = this.appName +" | "+ this.appVersion;
 
  iconClass = 'fa fa-bars fa-1x text-white';
  isActive = false;

  pageInit:number= 0;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private sessionService: SessionService,
    private shareappService: ShareAppService
  ) {

  }
  
  async ngOnInit(): Promise<void> {

   await this.dataService.getUserLoggedIn().subscribe((value) => {
      
       this.userLoginOn = value;

    });

  }


  ngOnChanges(changes: SimpleChanges): void {

  }
  ngAfterViewInit() {

    this.pageInit = 1;

  }
  ngOnDestroy(): void {

  }



  // -----------------------------------------
  // F_ boton menu cuando la vista es telefono
  // -----------------------------------------
  toggleIcon() {

    
    this.isActive = !this.isActive;
    const headerElement = document.getElementById('header');

    if (headerElement) {

      if (headerElement.style.height == '10vh') {
        
        headerElement.style.height = 'auto';
        this.iconClass = 'fa fa-times fa-1x text-white';
      } 
      else{

        headerElement.style.height = 'auto';
        this.iconClass = 'fa fa-bars fa-1x text-white';

      }



    } 



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


}
