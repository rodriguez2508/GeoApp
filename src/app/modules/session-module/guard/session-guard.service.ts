import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';

import { DataService } from '../../../services/data/data.service';
import { SessionService } from '../services/session.service';
import { StorageService } from '../../../services/storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class SessionGuardService {

  constructor(
    private data: DataService,
    private router: Router,
    private sessionService: SessionService,
    private storageService: StorageService,
    private dataService: DataService,
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
      this.dataService.setLoggedIn(false);

      return this.router.navigate(['/session/signin']);
    }

    const user = this.storageService.getUser();

    this.dataService.setLoggedIn(true);
    this.dataService.setuserData(user);

    return true;
  }
}
