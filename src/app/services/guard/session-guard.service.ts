import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';

import { DataService } from '../data.service';
import { SessionService } from '../session.service';

@Injectable({
  providedIn: 'root'
})
export class SessionGuardService {

  constructor(
    private data: DataService,
    private router: Router,
    private sessionService: SessionService
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
     
      return this.router.navigate(['/session/signin']); 
    }

    return true;
  }
}
