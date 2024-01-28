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

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { DataService } from '../../../services/data.service';
import { SessionService } from '../../../services/session.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements AfterViewInit, OnDestroy, OnChanges {

  datosUsuario: any;
  userLoginOn: boolean = false;

  // userIsAuth: Subscription;
  titleApp: string = "Linki"

  isClicked: boolean = false;
  linkActivo: number = 0;
  iconClass = 'fa fa-bars fa-1x text-white';
  isActive = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private sessionService: SessionService
  ) {

  }


  // F_ boton menu cuando la vista es telefono
  toggleIcon() {
    this.isActive = !this.isActive;
    const headerElement = document.getElementById('header');

    if (this.iconClass === 'fa fa-bars fa-1x text-white') {
      this.iconClass = 'fa fa-times fa-1x text-white';
      if (headerElement) {
        headerElement.style.height = 'auto';
      }
    } else {
      this.iconClass = 'fa fa-bars fa-1x text-white';
      if (headerElement) {
        headerElement.style.height = '10vh';
      }
    }
  }

  ngOnInit(): void {

    this.dataService.getUserLoggedIn().subscribe((value) => {
      this.userLoginOn = value;
      
    });

  }


  ngOnChanges(changes: SimpleChanges): void {

  }
  ngAfterViewInit(): void {


  }
  ngOnDestroy(): void {

  }

  //  F_ eliminar datos de Sesion
  async f_signOut() {

    const resultado = await this.dataService.showQuestion('¿Estás seguro de que deseas continuar?', 'warning', 'info');
    if (resultado) {
 
      // -- funcion para eliminar datos de la sesion
      this.sessionService.signout();

      // -- mostrar mensaje en la pantalla
      this.dataService.showMsjInData('Cerrando Sesión...', 'success', '/session/signin');
 
      // window.location.reload();

    } else {
      // Hacer algo si se cancela
    }

  }

}
