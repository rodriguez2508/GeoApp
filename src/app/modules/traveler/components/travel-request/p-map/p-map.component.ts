
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// --interfaces
import { I_UserMap } from '../../../../../interface/user.interface';
import { I_Places } from '../../../../../interface/places.interface';
// --interfaces

import { FavoritesPlacesService } from '../../../../../services/map/favorites-places.service';
import { Coordinate } from 'ol/coordinate';

import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from '../../../../../services/data/data.service';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { AddFavoritesPlacesComponent } from './../../shared/p-favorites-places/add-favorites-places/add-favorites-places.component';

@Component({
  selector: 'app-p-map',
  standalone: true,
  imports: [],
  templateUrl: './p-map.component.html',
  styleUrl: './p-map.component.scss',
})
export class PMapComponent implements OnChanges, AfterViewInit {


  private _snackBar = inject(MatSnackBar)

  @Input() connected_users: I_UserMap[] = [];
  @Input() connected_TravelerUsers: I_UserMap[] = [];
  @Input() connected_DriverUsers: I_UserMap[] = [];

  @Input() address: string = 'buscando..';
  @Input() distance: string = '0';
  @Input() coord: Coordinate = [];
  @Input() coord_destination: Coordinate = [];

  @Output() footerDisplayed = new EventEmitter<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private favoritePlacesService: FavoritesPlacesService,
    private dataService: DataService,
    public dialog: MatDialog
  ) { }
  ngOnChanges(changes: SimpleChanges): void { }
  ngAfterViewInit(): void { }

  reloadWithParams(view: string = 'form') {

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        view: view,
        lon: this.coord[0],
        lat: this.coord[1],
        lon_d: this.coord_destination[0],
        lat_d: this.coord_destination[1]
      }
    });
  }


  hideFooter() {
    this.footerDisplayed.emit(false);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddFavoritesPlacesComponent, {
      data: {},
    });
  
    dialogRef.afterClosed().subscribe(result => {
      // console.log('The dialog was closed', result);
      const name = result ? result : ''; 
      this.saveFavoritePlace(name);
      // this.animal = result;

      
    });
  } 

  saveFavoritePlace(name:string = '') {

    if (this.address == 'buscando..' || this.address == 'Buscando...' || this.address == 'Error de conexión.' ) {

      const config = this.dataService.openSnackBar('danger');
      this._snackBar.open('No se ha podido identificar el lugar.', 'CLOSE', config);

      
      return;
    }

    const dataPlace: I_Places = {
      coordinates: `${this.coord_destination[0]},${this.coord_destination[1]}`,
      name: name,
      address: this.address
    };

    this.favoritePlacesService.savePlace(dataPlace).subscribe({
      next: (response: any) => {

        const config = this.dataService.openSnackBar('success');
        this._snackBar.open('Se ha guardado el lugar..', 'CLOSE', config);

        this.hideFooter();
        return;
      },
      error: (error: any) => {

        const config = this.dataService.openSnackBar('danger');
        this._snackBar.open('Ha ocurrido un error en su petición..', 'CLOSE', config);
        this.hideFooter();
        console.error('Error register places:', error);

      },
      complete: () => {
        // Realizar acciones adicionales cuando el observable se completa, si es necesario
      },
    });


  }

} 