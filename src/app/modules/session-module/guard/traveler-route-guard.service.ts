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
export class TravelerRouteGuardService {

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
  
    const user = this.storageService.getUser(); 

    // console.log(user)
    if (user.user_type == 'traveler') return true;

    if (user.user_type == 'driver') return this.goToDriverView();
    if (user.user_type == 'admin') return this.goToAdminView();
     return false;
  } 


  goToDriverView() {

    return this.router.navigate(['/driver/offers-request'], { });
 
  }
  goToAdminView() {

    return this.router.navigate(['/public/not_found'], { });
 
  }
}
