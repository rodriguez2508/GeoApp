import { AfterViewInit, Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Coordinate } from 'ol/coordinate';

// -- services
import { DataService } from '../../../../../services/data/data.service';
import { OpenRouteService } from '../../../../../services/map/open-route.service';
// -- services
// -- components
import { FooterPageComponent } from '../footer-page/footer-page.component';
// -- components

@Component({
  selector: 'app-form-page',
  standalone: true,
  imports: [ReactiveFormsModule,FooterPageComponent],
  templateUrl: './form-page.component.html',
  styleUrl: './form-page.component.scss',
})
export class FormPageComponent implements OnInit,AfterViewInit{
  // ----------------------------------
  // -- Variables
  // ----------------------------------

  _role: string = 'undefined';
  coord: Coordinate = [];
  address_coord: string = '';
  coord_destination: Coordinate = [];
  address_coord_destination: string = '';

  title_page: string = 'Formulario de Viaje';
  form_request: FormGroup;

  form: any = {
    username: null,
    email: null,
    password: null,
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';
  checkAllvehicleType:boolean = false;


  footerDisplayed = false;
  methodToShowFooter: string = '';
  address: string = '';
  // ----------------------------------
  // -- Variables
  // ----------------------------------

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private dataService: DataService,
    private openRouteService: OpenRouteService
  ) {
    this.route.queryParams.subscribe((params) => {

      // --coord origen
      // this.coord = params['lon'] && params['lat'] ? [params['lon'], params['lat']] : [];
      this.coord = params['lon'] && params['lon'] !== 0  && params['lon']!== undefined &&  params['lat'] && params['lat'] !== 0  && params['lat']!== undefined ? [params['lon'], params['lat']] : [];
      // --coord destino
      this.coord_destination = params['lon_d'] && params['lon_d'] !== 0  && params['lon_d']!== undefined &&  params['lat_d'] && params['lat_d'] !== 0  && params['lat_d']!== undefined ? [params['lon_d'], params['lat_d']] : [];

    });

    this.form_request = this.f_createRequestForm();
  }

  ngOnInit(): void {
 
    if(this.coord && this.coord[0] != 0 && this.coord[1] != 0 && this.coord[0] !== undefined && this.coord[1] != undefined ) this.getAddress(this.coord, 'origin');
    
    if(this.coord_destination && this.coord_destination[0] != 0 && this.coord_destination[1] != 0 && this.coord_destination[0] !== undefined && this.coord_destination[1] != undefined ) this.getAddress(this.coord_destination, 'destination'); 

  }

  ngAfterViewInit(): void {}

  onSubmit(): void {

    // Tip: si los datos del formulario son incorrectos
    if (this.form_request.invalid) {
      this.form_request.markAllAsTouched();

      return;
    }
  }

  // ----------------------------------
  // -- crear el formulario
  // ----------------------------------
  private f_createRequestForm(): FormGroup {
    return this.fb.group({
      placeOrigin: [this.coord[0]+','+this.coord[1], [Validators.required, , this.customCoordValidator()]],
    
      placeDestination: [this.coord_destination[0]+','+this.coord_destination[1], [Validators.required, , this.customCoordValidator()]],
      personNumber: ['1', [Validators.required]],
      vehicleType: ['', [Validators.required]],
      maxTimeWaiting: ['15', [Validators.required]],
      travelPeferences: ['', []],
    });
  }

  // ----------------------------------
  // -- validaciones del formulario
  // ----------------------------------
  customCoordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const coordinates = control.value?.split(",") ?? [];
      const x1Coord = parseInt(coordinates[0], 10);
      const x2Coord = parseInt(coordinates[1], 10);
      
      if (isNaN(x1Coord) || x1Coord === 0 && isNaN(x2Coord) || x2Coord === 0) {
        return { coordInvalid: true };
      }

      return null;
    };
  }
  

  goToMap(): void {
    // window.location.assign(
    //   '/traveler/travel-request?view=map');

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          view: 'map',
        }
      });

  }

  private getAddress(coord: Coordinate, addresType:string) {
    this.openRouteService.getStreetInformation(coord).subscribe({
      next: (response: any) => {
        // const displayName = response.name;
        // const address = response.address; 

        console.log(response.address);
        console.log(response.address.road);

        let road = response.address.road;
        let neighbourhood = response.address.neighbourhood;
        let suburb = response.address.suburb;
        let city = response.address.city;
        let state = response.address.state;

        const address = `${road === undefined ? '' : road + ','} ${
          neighbourhood === undefined ? '' : neighbourhood + ','
        } ${city === undefined ? state : city + ','}`;
        
        if(addresType == 'origin'){
          this.address_coord = address;

        }else{
        this.address_coord_destination = address;

        }
        // this.distance = distance;
 
      },
      error: (error: any) => {
        // Manejar errores al obtener el estado del socket
        // console.error('Error en la solicitud a ORS:', error);
        this.address_coord = 'Error de conexión.';
        // this.distance = '0';
      },
      complete: () => {
        // Realizar acciones adicionales cuando el observable se completa, si es necesario
      },
    });
  }

  showFooterOnButton() {
    this.footerDisplayed = !this.footerDisplayed;
    this.address = 'Definir destino';
    if (!this.footerDisplayed) {
      this.address = '';
      // this.distance = '0'; 
    }
    this.methodToShowFooter = 'button';
  }
  
  checkedAllvehicleType(){
    this.checkAllvehicleType = !this.checkAllvehicleType;
  }
  // ----------------------------------
  // -- para obtener el valor de los campos del form
  // ----------------------------------

  public get f(): any {
    return this.form_request.controls;
  }

  get role(): string | undefined {
    return this._role;
  }
}
