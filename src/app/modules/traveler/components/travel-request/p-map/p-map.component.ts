import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

// --interfaces
import { I_UserMap } from '../../../../../interface/user.interface';
import { Coordinate } from 'ol/coordinate';
import { ActivatedRoute, Router } from '@angular/router';
// --interfaces
@Component({
  selector: 'app-p-map',
  standalone: true,
  imports: [],
  templateUrl: './p-map.component.html',
  styleUrl: './p-map.component.scss',
})
export class PMapComponent implements OnChanges, AfterViewInit {
  @Input() connected_users: I_UserMap[] = [];
  @Input() connected_TravelerUsers: I_UserMap[] = [];
  @Input() connected_DriverUsers: I_UserMap[] = [];

  @Input() address: string = 'Buscando...';
  @Input() distance: string = '0';
  @Input() coord: Coordinate = [];
  @Input() coord_destination: Coordinate = [];

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
  ) {}
  ngOnChanges(changes: SimpleChanges): void {}
  ngAfterViewInit(): void {}

  reloadWithParams() {
    // window.location.assign(
    //   '/traveler/travel-request?view=form&lon=' +
    //     this.coord[0] +
    //     '&lat=' +
    //     this.coord[1] +
    //     '&lon_d=' +
    //     this.coord_destination[0] +
    //     '&lat_d=' +
    //     this.coord_destination[1]
    // );

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        view: 'form',
        lon: this.coord[0],
        lat: this.coord[1],
        lon_d: this.coord_destination[0],
        lat_d: this.coord_destination[1]
      }
    });
  }
}
