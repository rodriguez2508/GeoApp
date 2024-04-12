import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { Socket, SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { environment } from '../environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { loggerInterceptor } from './logger.interceptor';
import { errorInterceptor } from './error.interceptor';
import { apiInterceptor } from './api.interceptor';

const NO_NG_MODULES = importProvidersFrom([BrowserAnimationsModule]);

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideClientHydration(),
        provideHttpClient(
            withInterceptors([
                loggerInterceptor,
                // apiInterceptor,
                errorInterceptor
            ]),
            withFetch()

        ),
        NO_NG_MODULES,

        {
            provide: Socket,
            useFactory: () => {

                const socket_status = new Socket(
                    {
                        url: `${environment.socketUrl}`,
                        options: {
                            extraHeaders: {}
                        }
                    }
                );

                socket_status.connect();
                return socket_status;
            }
        },
        importProvidersFrom(provideFirebaseApp(() => initializeApp({ "projectId": "linki-1705538005282", "appId": "1:74031992174:web:75c735de348eff5a7f057f", "storageBucket": "linki-1705538005282.appspot.com", "apiKey": "AIzaSyBsa1F_barXDzFkHoVHAXjs1d-1DjPktS0", "authDomain": "linki-1705538005282.firebaseapp.com", "messagingSenderId": "74031992174", "measurementId": "G-STE1SHH96F" }))), importProvidersFrom(provideAuth(() => getAuth())),
        importProvidersFrom(provideFirestore(() => getFirestore())),
        provideAnimationsAsync(),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
        }),
    ]
};

