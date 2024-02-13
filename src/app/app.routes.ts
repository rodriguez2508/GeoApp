import { Routes } from '@angular/router';
import { SessionGuardService } from './modules/session-module/guard/session-guard.service';
import { PublicRouteGuardService } from './modules/session-module/guard/public-route-guard.service';

export const routes: Routes = [

    
    { 
        path: 'public',
        canActivate: [PublicRouteGuardService],
        loadChildren: () => import('./modules/public-module/public.module').then((m) => m.PublicModule) },
        
    { 
        path: 'map', 
        canActivate: [SessionGuardService], 
        loadChildren: () => import('./modules/map-module/map.module').then((m) => m.MapModule) },

    { 
        path: 'session', 
        canActivate: [PublicRouteGuardService], 
        loadChildren: () => import('./modules/session-module/session.module').then((m) => m.SessionModule) },


        { 
            path: 'traveler', 
            canActivate: [SessionGuardService], 
            loadChildren: () => import('./modules/traveler/traveler.module').then((m) => m.TravelerModule) },
    

            
    // -----------------------------------
    // -----------------------------------
    {
        path: '',
        redirectTo: 'public/home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'public/home',
        pathMatch: 'full'
    },
    
 
];
