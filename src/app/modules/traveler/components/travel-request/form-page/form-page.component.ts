import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { TripTravelerService } from '../../../../../services/trip/trip-traveler.service';
import { I_Places } from '../../../../../interface/places.interface';
import { I_UserSessionStorage } from '../../../../../interface/user.interface';
// -- components

@Component({
  selector: 'app-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, FooterPageComponent],
  templateUrl: './form-page.component.html',
  styleUrl: './form-page.component.scss',
})
export class FormPageComponent implements OnInit, AfterViewInit, OnChanges {
  // ----------------------------------
  // -- Variables
  // ----------------------------------


  private _snackBar = inject(MatSnackBar)

  // -- Rol del usuario conectado
  _role: string = 'undefined';
  // --coordenadas de la posicion actual del usuario
  coord: Coordinate = [];
  // --lugar de la posicion actual del usuario
  address_coord: string = '';
  // --coordenadas de la posicion destino del usuario
  coord_destination: Coordinate = [];
  // --lugar de la posicion destino del usuario
  address_coord_destination: string = '';

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
  @Input() favoriteMarkers: I_Places[] = [];

  title_page: string = 'Solicitud de viaje';
  form_request: FormGroup;

  form: any = {
    username: null,
    email: null,
    password: null,
  };
  // -- para mostrar el mapa con la ruta si existen las 2 coordenadas (origen y destino )
  showMap = false;

  checkAllvehicleType: boolean = false;


  footerDisplayed = false;
  placeSelected = '';
  methodToShowFooter: string = '';
  address: string = '';
  // ----------------------------------
  // -- Variables
  // ----------------------------------

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private tripTravelerService: TripTravelerService,
    private dataService: DataService,
    private openRouteService: OpenRouteService
  ) {
    this.route.queryParams.subscribe((params) => {

      // -- Validacion que las coordenadas por parametro mo sean igual a 0 nu sean undefined
      // --coord origen
      // this.coord = params['lon'] && params['lat'] ? [params['lon'], params['lat']] : [];
      this.coord = params['lon'] && params['lon'] !== 0 && params['lon'] !== undefined && params['lat'] && params['lat'] !== 0 && params['lat'] !== undefined ? [params['lon'], params['lat']] : [];
      // --coord destino
      this.coord_destination = params['lon_d'] && params['lon_d'] !== 0 && params['lon_d'] !== undefined && params['lat_d'] && params['lat_d'] !== 0 && params['lat_d'] !== undefined ? [params['lon_d'], params['lat_d']] : [];

    });

    this.form_request = this.f_createRequestForm();
  }
  ngOnChanges(changes: SimpleChanges): void {

    if ('coord' in changes || 'coord_destination' in changes) {

      // -- Verifica que las coordenadas de origen y destino existan y sean diferente a CERO
      if ((this.coord && (this.coord[0] != 0 && this.coord[1] != 0) && (this.coord[1] != 0 && this.coord[1] != 0)) && (this.coord_destination && (this.coord_destination[0] != 0 && this.coord_destination[1] != 0) && (this.coord_destination[1] != 0 && this.coord_destination[1] != 0))) {
        this.showMap = true;
      }
    }

    if ('placeSelected' in changes) {

      const coordenadasArray: string[] = this.placeSelected.split(',');

      this.coord_destination = [+coordenadasArray[0], +coordenadasArray[1]];

      if (this.checkCoordinates('destination')) this.getAddress(this.coord_destination, 'destination');

    }
  }

  ngOnInit(): void {

    if (this.checkCoordinates('origin')) this.getAddress(this.coord, 'origin');
    if (this.checkCoordinates('destination')) this.getAddress(this.coord_destination, 'destination');

  }

  ngAfterViewInit(): void { }

  onSubmit(): void {

    // Tip: si los datos del formulario son incorrectos
    if (this.form_request.invalid) {
      this.form_request.markAllAsTouched();

      console.log('form is invalid');


      const config = this.dataService.openSnackBar('danger');
      this._snackBar.open('Por favor, revise el formulario', 'CLOSE', config);


      return;
    }

    this.saveTravelRequest();
  }

  // ----------------------------------
  // -- crear el formulario
  // ----------------------------------
  private f_createRequestForm(): FormGroup {
    return this.fb.group({
      placeOrigin: [`${this.coord[0]},${this.coord[1]}`, [Validators.required, , this.customCoordValidator()]],

      placeDestination: [`${this.coord_destination[0]},${this.coord_destination[1]}`, [Validators.required, , this.customCoordValidator()]],
      personNumber: ['0', [Validators.required]],
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


  // ----------------------------------
  // TODO: funcion para guardar formulario de solicitud de viaje   
  // ----------------------------------
  saveTravelRequest() {

    // origin_address: 
    //   destination_address: string;

    this.form_request.value.origin_address = this.address_coord;
    this.form_request.value.destination_address = this.address_coord_destination;
 
    console.log(this.form_request.value)
    this.tripTravelerService.saveTravelRequest(this.form_request.value, this.userData.id).subscribe({
      next: (data: any) => {


        this.goToTravelHistory();
        const config = this.dataService.openSnackBar('success');
        this._snackBar.open('Solicitud realizada con éxito', 'CLOSE', config);

      },
      error: (errorData) => {

        console.log(errorData)

        const config = this.dataService.openSnackBar('danger');
        this._snackBar.open('Ha ocurrido un error en la solicitud', 'CLOSE', config);

      },
      complete: () => {

      },
    });


  }
 
  // TODO ---------------------------------------
  // -- Ir a la ruta del mapa  
  // 
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
 // TODO ---------------------------------------
  // -- Ir a la ruta del mapa  
  // 
  goToTravelHistory(): void {
    // window.location.assign(
    //   '/traveler/travel-request?view=map');

    this.router.navigate(['/traveler/travel-history'], { 
      queryParams: {
         
      }
    });

  }

  // TODO ---------------------------------------
  // -- comprueba que las coordenadas esten en formato correcto
  // 
  checkCoordinates(type: string): boolean {

    //  -- si el tipo de coord es origen 
    if (type === 'origin')
      if (this.coord && this.coord[0] != 0 && this.coord[1] != 0 && this.coord[0] !== undefined && this.coord[1] != undefined) return true;

    //  -- si el tipo de coord es destino 
    if (type === 'destination')
      if (this.coord_destination && this.coord_destination[0] != 0 && this.coord_destination[1] != 0 && this.coord_destination[0] !== undefined && this.coord_destination[1] != undefined) return true;

    return false;

  }


  // TODO ---------------------------------------
  // -- Para obtener la direccion de la coordenada marcada de la api 
  // 
  private getAddress(coord: Coordinate, addresType: string) {
 
    this.openRouteService.getStreetInformation(coord).subscribe({
      next: (response: any) => {
        // const displayName = response.name;
        // const address = response.address; 

        // console.log(response.address);
        // console.log(response.address.road);

        let road = response.address.road;
        let neighbourhood = response.address.neighbourhood;
        let suburb = response.address.suburb;
        let city = response.address.city;
        let state = response.address.state;

        const address = `${road === undefined ? '' : road + ','} ${neighbourhood === undefined ? '' : neighbourhood + ','
          } ${city === undefined ? state : city}`;

        if (addresType == 'origin') {
          this.address_coord = address;

        } else {
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


  // TODO ---------------------------------------
  // -- muestra y oculta el footer en el formulario,  
  // 
  showFooterOnButton() {
    this.footerDisplayed = !this.footerDisplayed;
    this.address = 'Definir destino';
    if (!this.footerDisplayed) {
      this.address = '';
      // this.distance = '0'; 
    }
    this.methodToShowFooter = 'button';
  }

  // TODO ---------------------------------------
  // -- para seleccionar lugar favorito al seleccionar de la lista y agregarlo al campo Destino del Form 
  // 
  selectPlace(event: string) {
     
    const coordenadasArray: string[] = event.split(',');

    this.coord_destination = [+coordenadasArray[0], +coordenadasArray[1]];

    if (this.checkCoordinates('destination')) this.getAddress(this.coord_destination, 'destination');
  }
 
  checkedAllvehicleType() {
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
