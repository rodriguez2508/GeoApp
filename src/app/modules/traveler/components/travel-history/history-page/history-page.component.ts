import { TripTravelerService } from './../../../../../services/trip/trip-traveler.service';
import { AfterViewInit, Component, OnChanges, SimpleChanges, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';

import { I_UserSessionStorage } from '../../../../../interface/user.interface';
import { FavoritesPlacesService } from '../../../../../services/map/favorites-places.service';
import { I_FormTravelRequest } from '../../../../../interface/trip.interface';
import { StorageService } from '../../../../../services/storage/storage.service';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [],
  templateUrl: './history-page.component.html',
  styleUrl: './history-page.component.scss'
})
export class HistoryPageComponent implements OnChanges, AfterViewInit {


  private _snackBar = inject(MatSnackBar);

  title_page: string = 'Lugares Favoritos';
  travels: I_FormTravelRequest[] = [];
  userData: I_UserSessionStorage = {
    id: '',
    ci: '',
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone: '',
    user_type: ''
  };
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tripTravelerService: TripTravelerService,
    private storageService: StorageService) {

  }
  ngOnChanges(changes: SimpleChanges): void {

  }
  ngAfterViewInit(): void {

    this.userData = this.storageService.getUser();

    this.getTravels(this.userData.id);
  }



  // ---------------------------------------------------
  //TODO -- Obtiene los lugares favoritos del usuario
  // ---------------------------------------------------
  getTravels(user_id: string) {


    this.tripTravelerService.getTravels(user_id).subscribe(
      {
        next: (data) => {

          console.log(data)
          if (data && data.length != 0) {

            for (let i = 0; i < data.length; i++) {
              this.travels[i] = {
                origin_coordinate: data[i].origin_coordinate,
                destination_coordinate: data[i].destination_coordinate,
                destination_address: data[i].destination_address,
                origin_address: data[i].origin_address,
                status: data[i].status,
                driver_id: data[i].driver_id,
                traveler_id: data[i].traveler_id,
                vehicleType: data[i].vehicleType,
                personNumber: data[i].personNumber,
                maxTimeWaiting: data[i].maxTimeWaiting,
                travelPeferences: data[i].travelPeferences
              };
            }
          }

          console.log(this.travels)

        },
        error: (error) => {
          console.log(error)
        }
      }

    );

  }



}
