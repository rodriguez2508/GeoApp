import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';

// --interfaces
import { I_UserMap, I_UserSessionStorage } from '../../../../../interface/user.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FavoritesPlacesService } from '../../../../../services/map/favorites-places.service';
import { I_Places } from '../../../../../interface/places.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../../../services/storage/storage.service';
// --interfaces
@Component({
  selector: 'app-p-favoritesplaces',
  standalone: true,
  imports: [],
  templateUrl: './p-favoritesplaces.component.html',
  styleUrl: './p-favoritesplaces.component.scss'
})
export class PFavoritesPlacesComponent implements OnChanges, AfterViewInit {


  private _snackBar = inject(MatSnackBar);

  title_page: string = 'Lugares Favoritos';
  favoriteMarkers: I_Places[] = [];
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
    private favoritePlacesService:FavoritesPlacesService,
    private storageService: StorageService){

  }
  ngOnChanges(changes: SimpleChanges): void {
    
  }
  ngAfterViewInit(): void {
    
    this.userData = this.storageService.getUser();
    
    this.getFavoritePlaces(this.userData.id);

  }
  

  // ---------------------------------------------------
  //TODO -- Obtiene los lugares favoritos del usuario
  // ---------------------------------------------------
  getFavoritePlaces(user_id: string) {


    this.favoritePlacesService.getPlaceByUser(user_id).subscribe(
      {
        next: (data) => {
 
          if (data && data.length != 0) {
               
            for (let i = 0; i < data.length; i++) {
              this.favoriteMarkers[i] = {
                coordinates: data[i].coordinates,
                address: data[i].address,
                name: data[i].name,
              };
            }
          }

            console.log(this.favoriteMarkers)

          },
          error: (error) => {
            console.log(error)
          }
        }

    );

  }


  goToMap(): void {
    // window.location.assign(
    //   '/traveler/travel-request?view=map');

    this.router.navigate(['/traveler/travel-request'], { 
      queryParams: { 
        view: 'map',
      }
    });

  }

}
