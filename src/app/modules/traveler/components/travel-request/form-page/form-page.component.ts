import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
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
import { PMapRouteComponent } from '../../shared/p-map-route/p-map-route.component';
// -- components

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs';
@Component({
  selector: 'app-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, FooterPageComponent, PMapRouteComponent, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './form-page.component.html',
  styleUrl: './form-page.component.scss',
})
export class FormPageComponent implements OnInit, AfterViewInit, OnChanges {
  // ----------------------------------
  // -- Variables
  // ----------------------------------


  private _snackBar = inject(MatSnackBar)

  showHiddenInput: boolean = false;
  personNumber: number = 1;


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
  saveTravel =
    {
      ongoing: false,
      pending: false
    };


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
    private tripTravelerService: TripTravelerService,
    private dataService: DataService,
    private elementRef: ElementRef,
    private openRouteService: OpenRouteService

  ) {
    this.route.queryParams.subscribe((params) => {

      // -- Validacion que las coordenadas por parametro no sean igual a 0 ni sean undefined
      // --coord origen
      // this.coord = params['lon'] && params['lat'] ? [params['lon'], params['lat']] : [];
      this.coord = params['lon'] && params['lon'] !== 0 && params['lon'] !== undefined && params['lat'] && params['lat'] !== 0 && params['lat'] !== undefined ? [parseFloat(params['lon']), parseFloat(params['lat'])] : [];
      // --coord destino
      this.coord_destination = params['lon_d'] && params['lon_d'] !== 0 && params['lon_d'] !== undefined && params['lat_d'] && params['lat_d'] !== 0 && params['lat_d'] !== undefined ? [parseFloat(params['lon_d']), parseFloat(params['lat_d'])] : [];


    });

    this.form_request = this.f_createRequestForm();
  }
  ngOnChanges(changes: SimpleChanges): void {

    if ('coord' in changes || 'coord_destination' in changes) {

      console.log('coord in changes', this.coord, this.coord_destination)
      // -- Verifica que las coordenadas de origen y destino existan y sean diferente a CERO
      if (this.checkCoordinates('origin') && this.checkCoordinates('destination')) {
        this.showMap = true;
      }
    }

  }

  ngOnInit(): void {


  }

  ngAfterViewInit(): void {

    // -- Verificar las coordenadas y agregarlas a los campos del form

    let coord_true = 0;

    if (this.checkCoordinates('origin')) { this.getAddress(this.coord, 'origin'); coord_true = 1; }

    if (this.checkCoordinates('destination')) { this.getAddress(this.coord_destination, 'destination'); coord_true = 2; };

    if (coord_true == 2) {

      this.showMap = true;
    }


    // -- verificar que existan viajes en curso
    if (this.userData.id != '') {
      this.getTravels(this.userData.id, 'ongoing');
      this.getTravels(this.userData.id, 'pending');
    }


  }

  onSubmit(): void {

    const coord_origin = `${this.coord[0]},${this.coord[1]}`;
    const coord_destination = `${this.coord_destination[0]},${this.coord_destination[1]}`;

    // this.form_request.value.placeOrigin = coord_origin;
    // this.form_request.value.placeDestination = coord_destination;
    // this.form_request.value.origin_address = this.address_coord;
    // this.form_request.value.destination_address = this.address_coord_destination;
    // this.form_request.value.personNumber = `${this.personNumber}`;

    this.form_request.patchValue({
      placeOrigin: coord_origin,
      placeDestination: coord_destination,
      origin_address: this.address_coord,
      destination_address: this.address_coord_destination,
      personNumber: `${this.personNumber}`
    });

    this.form_request.markAllAsTouched();

    // Tip: si los datos del formulario son incorrectos
    if (this.form_request.invalid || this.address_coord == 'Definir su ubicación' || this.address_coord == 'Error de conexión.' || this.address_coord_destination == 'Definir destino' || this.address_coord_destination == 'Error de conexión.') {


      console.log('form is invalid', this.form_request.value);


      // const config = this.dataService.openSnackBar('danger');
      // this._snackBar.open('Por favor, revise el formulario', 'CLOSE', config);

      this.dataService.showMsj('Por favor, revise el formulario.', 'Formulario Incorrecto', 'error');

      return;
    }

    this.saveTravelRequest();
  }

  // ----------------------------------
  // -- crear el formulario
  // ----------------------------------
  private f_createRequestForm(): FormGroup {

    const coord_origin = `${this.coord[0]},${this.coord[1]}`;
    const coord_destination = `${this.coord_destination[0]},${this.coord_destination[1]}`;
    const personNumber = `${this.personNumber}`;

    return this.fb.group({
      placeOrigin: [coord_origin, [Validators.required, this.customCoordValidator('origin')]],

      placeDestination: [coord_destination, [Validators.required, this.customCoordValidator('destination')]],
      origin_address: [this.address_coord, [Validators.required]],
      destination_address: [this.address_coord_destination, [Validators.required]],
      personNumber: [personNumber, [Validators.required, Validators.min(1)]],
      // vehicleType: ['', [Validators.required]],
      maxTimeWaiting: ['15', [Validators.required]],
      travelPeferences: ['', []],
    });
  }

  // ----------------------------------
  // -- validaciones del formulario
  // ----------------------------------
  customCoordValidator(coord: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {

      if (coord === 'origin') {

        const x1Coord = this.coord[0];
        const x2Coord = this.coord[1];

        if (isNaN(x1Coord) || x1Coord == 0 && isNaN(x2Coord) || x2Coord == 0) {
          return { coordInvalid: true };
        }
      } else if (coord === 'destination') {

        const x1Coord = this.coord_destination[0];
        const x2Coord = this.coord_destination[1];

        if (isNaN(x1Coord) || x1Coord == 0 && isNaN(x2Coord) || x2Coord == 0) {
          return { coordInvalid: true };
        }
      }

      return null;
    };
  }


  // ----------------------------------
  // TODO: funcion para guardar formulario de solicitud de viaje   
  // ----------------------------------
  saveTravelRequest() {

    if (!this.saveTravel.ongoing || !this.saveTravel.pending) {


      const config = this.dataService.openSnackBar('success',3);
      const snackBarRef = this._snackBar.open('Aun tiene viajes pendientes', 'CLOSE', config);
      this.goToTravelHistory();
      
      snackBarRef.afterDismissed().subscribe(() => {
        
        this.reload();
        
      });
      return;

    }
    // origin_address: 
    //   destination_address: string;

    // console.log(this.form_request.value)
    this.tripTravelerService.saveTravelRequest(this.form_request.value, this.userData.id).pipe(
      take(1)
    ).subscribe(
      data => {

        const config = this.dataService.openSnackBar('success', 3);
        const snackBarRef = this._snackBar.open('Solicitud realizada con éxito', 'CLOSE', config);

        this.goToTravelHistory();
      
        snackBarRef.afterDismissed().subscribe(() => {
          
          this.reload();
          
        });
      }
    );



  }


  // ---------------------------------------------------
  //TODO -- Obtiene los viajes del usuario
  // ---------------------------------------------------
  getTravels(user_id: string, status: string = 'ongoing') {


    // StatusTravel :
    // --> 1 Pendiente
    // --> 2 En curso
    // --> 3 Completado
    this.tripTravelerService.getTravels(user_id, status).pipe(
      take(1)
    ).subscribe(

      data => {

        if (data && data.length != 0) {

          if (status == 'ongoing') {
            this.saveTravel.ongoing = false;
          }
          if (status == 'pending') {
            this.saveTravel.pending = false;
          }

        }

        else {
          if (status == 'ongoing') {
            this.saveTravel.ongoing = true;
          }
          if (status == 'pending') {
            this.saveTravel.pending = true;
          }
        }
      }

    );

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
 
    // this.router.navigateByUrl('/traveler/travel-history');

    this.router.navigate(['/traveler/travel-history'], { queryParams: {}, replaceUrl: true });

    // this.router.navigate(['/traveler/travel-history'], {
    //   queryParams: {

    //   }
    // });

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

        console.log(response.address)
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
        if (addresType == 'origin') {
          this.address_coord = 'Error de conexión.';

        } else {
          this.address_coord_destination = 'Error de conexión.';

        }

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
  showFooter() {
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

    this.coord_destination = [parseFloat(coordenadasArray[0]), parseFloat(coordenadasArray[1])];
    const coord_destination = `${this.coord_destination[0]},${this.coord_destination[1]}`;
    // if (this.checkCoordinates('destination')) 

    if (this.checkCoordinates('destination')) {

      this.form_request.value.placeDestination = coord_destination;

      this.getAddress(this.coord_destination, 'destination');
      this.showMap = true;
    }
  }

  reload() {

    window.location.reload();

  }

  handleRadioChange(event: any) {
    const selectedValue = event.target.value;

    console.log(selectedValue);
    if (selectedValue === 'n') {
      this.showHiddenInput = true;
      // this.personNumber = -0;
    } else {
      this.showHiddenInput = false;
      this.personNumber = parseInt(selectedValue);
    }


  }

  f_rotate_btn(icon_class: string) {

    const icon = this.elementRef.nativeElement.querySelector('.' + icon_class);
    icon.classList.add("rotate-icon");

    setTimeout(() => {
      icon.classList.remove("rotate-icon");
    }, 7000); // Remover la clase después de un segundo (1000ms)
  }


  public get f(): any {
    return this.form_request.controls;
  }

  get role(): string | undefined {
    return this._role;
  }
}
