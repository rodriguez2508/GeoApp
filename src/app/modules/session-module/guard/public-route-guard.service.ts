import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';

import { DataService } from '../../../services/data.service';
import { SessionService } from '../services/session.service';

@Injectable({
  providedIn: 'root'
})
export class PublicRouteGuardService {

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
     
      return true;
    }

    return this.router.navigate(['/map/show']);
  }
}
