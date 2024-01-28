import { InjectionToken } from '@angular/core';
import { Sockets } from './sockets'; 
import { SocketioService } from './../services/socketio.service';

export const SOCKET_SERVICE = new InjectionToken<Sockets>('Sockets');

export function socketsFactory(): Sockets{
    
    return new Sockets();
}