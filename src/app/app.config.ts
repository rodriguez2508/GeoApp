import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
 
import { Socket } from 'ngx-socket-io';
import { environment } from '../environments/environment'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
    ),
    {
      provide: Socket,
      useFactory: () => {
        const socket = new Socket({
            url: environment.socketUrl, options: {
          // url: 'http://localhost:3000', options: {
            extraHeaders: {}
          }
        });
        socket.connect();
        return socket;
      }
    },  
  ]
}; 

