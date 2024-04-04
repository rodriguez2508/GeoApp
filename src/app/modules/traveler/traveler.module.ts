import { Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TravelerRoutingModule } from './traveler-routing.module';

import { environment } from '../../../environments/environment';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io'; 

// const socketConfig_status: SocketIoConfig = {
//   url: `${environment.socketUrl}`,
//   options: {}
// };
// const socketConfig_offers: SocketIoConfig = { 
//   url: `${environment.socketUrl}/socketio/offers`, 
//   options: {} 
// };

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TravelerRoutingModule,
    // SocketIoModule.forRoot(socketConfig_status),
    // SocketIoModule.forRoot(socketConfig_offers)

  ]
})
export class TravelerModule { }
