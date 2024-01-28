import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MapRoutingModule } from './map-routing.module';
import { SOCKET_SERVICE, socketsFactory } from '../../models/socket.service.token';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MapRoutingModule,

  ],
  providers: [
     
  ]
})
export class MapModule { }
