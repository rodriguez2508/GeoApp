import { Routes } from '@angular/router';
import { SessionGuardService } from './services/guard/session-guard.service';

export const routes: Routes = [

    { 
        path: 'public',
        loadChildren: () => import('./modules/public-module/public.module').then((m) => m.PublicModule) },
        
    { 
        path: 'map', 
        canActivate: [SessionGuardService], 
        loadChildren: () => import('./modules/map-module/map.module').then((m) => m.MapModule) },

    { 
        path: 'session', 
        loadChildren: () => import('./modules/session-module/session.module').then((m) => m.SessionModule) },


    // -----------------------------------
    // -----------------------------------

    {
        path: '',
        redirectTo: 'session/signin',
        pathMatch: 'full'
    },

    { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
];
