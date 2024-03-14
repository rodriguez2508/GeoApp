import { Injectable } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';

import { DataService } from '../../../services/data/data.service';
import { SessionService } from '../../../services/session/session.service';
import { StorageService } from '../../../services/storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class PublicRouteGuardService {

  constructor(
    private storageService: StorageService,
    private router: Router,
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private dataService: DataService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    // Aquí va la lógica de tu guard de ruta

    if (!Boolean(this.sessionService.isAuthenticated())) {

      return true;
    }

    const user = this.storageService.getUser();
    this.dataService.setLoggedIn(true);
    this.dataService.setuserData(user);

    // console.log(user)
    if (user.user_type == 'traveler') return this.goToTravelerView();
    else if (user.user_type == 'driver') return this.goToDriverView();
    else if (user.user_type == 'admin') return this. goToTravelerView();

    return this.router.navigate(['/traveler/travel-request']);
  }


  goToTravelerView() {

    return this.router.navigate(['../traveler/travel-request'], { relativeTo: this.route });
    
    // this.router.navigate(['/traveler/travel-request'], {
    //   queryParams: {

    //   },
    // });
  }
  goToDriverView() {

    return this.router.navigate(['../traveler/travel-request'], { relativeTo: this.route });
     
  }
}
