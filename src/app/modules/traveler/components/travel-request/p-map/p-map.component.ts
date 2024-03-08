import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';

// --interfaces
import { I_UserMap } from '../../../../../interface/user.interface';
import { Coordinate } from 'ol/coordinate';
import { ActivatedRoute, Router } from '@angular/router';
import { FavoritesPlacesService } from '../../../../../services/map/favorites-places.service';
import { I_Places } from '../../../../../interface/places.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from '../../../../../services/data/data.service';
// --interfaces
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

  @Input() address: string = 'Buscando...';
  @Input() distance: string = '0';
  @Input() coord: Coordinate = [];
  @Input() coord_destination: Coordinate = [];

  @Output() footerDisplayed = new EventEmitter<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private favoritePlacesService: FavoritesPlacesService,
    private dataService: DataService
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


  saveFavoritePlace() {

    if (this.address != 'Buscando...') {

      const dataPlace: I_Places = {
        coordinates: `${this.coord_destination[0]},${this.coord_destination[1]}`,
        name: this.address,
        description: ''
      };




      this.favoritePlacesService.savePlace(dataPlace).subscribe({
        next: (response: any) => {

          console.log(response)

          const config = this.dataService.openSnackBar('success');
          this._snackBar.open('Se ha guardado el lugar..', 'CLOSE', config);

          this.hideFooter();
          return;
        },
        error: (error: any) => {

          const config = this.dataService.openSnackBar('success');
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

}
