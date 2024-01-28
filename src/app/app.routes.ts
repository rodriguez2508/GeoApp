import { Routes } from '@angular/router';
import { SectionMapComponent } from './components/map/section-map/section-map.component';
import { SessionGuardService } from './services/guard/session-guard.service';

export const routes: Routes = [

    { 
        path: 'public',
        loadChildren: () => import('./components/public/public.module').then((m) => m.PublicModule) },

    { 
        path: 'map', 
        canActivate: [SessionGuardService], 
        loadChildren: () => import('./components/map/map.module').then((m) => m.MapModule) },

    { 
        path: 'session', 
        loadChildren: () => import('./components/session/session.module').then((m) => m.SessionModule) },


    // -----------------------------------
    // -----------------------------------

    {
        path: '',
        redirectTo: 'session/signin',
        pathMatch: 'full'
    },

    { path: '**', redirectTo: 'notfound', pathMatch: 'full' },
];
