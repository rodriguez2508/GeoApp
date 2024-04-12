import { Routes } from '@angular/router';
import { SessionGuardService } from './modules/session-module/guard/session-guard.service';
import { TravelerRouteGuardService } from './modules/session-module/guard/traveler-route-guard.service';
import { PublicRouteGuardService } from './modules/session-module/guard/public-route-guard.service';
import { DriverRouteGuardService } from './modules/session-module/guard/driver-route-guard.service';

export const routes: Routes = [


    {
        path: 'public',
        canActivate: [PublicRouteGuardService],
        loadChildren: () => import('./modules/public-module/public.module').then((m) => m.PublicModule)
    },

    // {
    //     path: 'map',
    //     canActivate: [SessionGuardService],
    //     loadChildren: () => import('./modules/map-module/map.module').then((m) => m.MapModule)
    // },

    {
        path: 'session',
        canActivate: [PublicRouteGuardService],
        loadChildren: () => import('./modules/session-module/session.module').then((m) => m.SessionModule)
    },


    {
        path: 'traveler',
        canActivate: [SessionGuardService, TravelerRouteGuardService],
        loadChildren: () => import('./modules/traveler/traveler.module').then((m) => m.TravelerModule)
    },

    {
        path: 'driver',
        canActivate: [SessionGuardService, DriverRouteGuardService],
        loadChildren: () => import('./modules/driver/driver.module').then((m) => m.DriverModule)
    },


    {
        path: '',
        redirectTo: 'public/home',
        pathMatch: 'full'
    },
    // {
    //     path: '**',
    //     redirectTo: 'public/not_found',
    //     pathMatch: 'full'
    // },


];

