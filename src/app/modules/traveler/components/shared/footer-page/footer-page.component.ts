import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

// --components
import { PUsersonlineComponent } from '../p-usersonline/p-usersonline.component';
// --components
// -- Interfaces
import { I_ConnectedUser } from '../../../../../interface/user.interface';
// -- Interfaces
// -- services
import { GeolocService } from '../../../../../services/geolocation/geoloc.service';
import { DataService } from '../../../../../services/data/data.service';
import { PMapComponent } from '../p-map/p-map.component';
// -- services

@Component({
  selector: 'app-footer-page',
  standalone: true,
  imports: [PUsersonlineComponent, PMapComponent],
  templateUrl: './footer-page.component.html',
  styleUrl: './footer-page.component.scss'
})
export class FooterPageComponent implements OnInit, OnChanges {
 
  @Input() connected_users: I_ConnectedUser[] = [];   
  @Input() methodToShowFooter: string = ''; 
  @Input() address: string = 'Buscando...';  
  @Input() distance: string = '0';  
  
  connected_TravelerUsers: I_ConnectedUser[] = [];
  connected_DriverUsers: I_ConnectedUser[] = []; 
  

  userLoginOn: boolean = false;

  panelDisplayed = false;


  // private connectedUsers: { [id: string]: any } = {};  

  constructor(private geolocService: GeolocService, private dataService:DataService, ){
    
  }

  ngOnInit(): void {

    // -- para verificar si el usuario tiene la sesion activa
    this.dataService.getUserLoggedIn().subscribe((value) => {
      this.userLoginOn = value;
      
    });
 
  }

  ngOnChanges(changes: SimpleChanges): void {
 
    if ('connected_users' in changes) {
      this.getAndUpdateConnectedTravelerUsers();
      this.getAndUpdateConnectedDriverUsers();
    }
    if ('distance' in changes) {
      this.distance = parseFloat(this.distance) < 1 ? parseFloat(this.distance)*1000 + ' m': parseFloat(this.distance) +' km' ;
    }
    


  }

  getConnectedUsersByType(userType: string): I_ConnectedUser[] {
    return this.connected_users.filter((user: I_ConnectedUser) => user.user.user_type === userType);
  }

  getAndUpdateConnectedTravelerUsers(): void {
    this.connected_TravelerUsers = this.getConnectedUsersByType('traveler');
  }

  getAndUpdateConnectedDriverUsers(): void {
    this.connected_DriverUsers = this.getConnectedUsersByType('driver');
  }
  showPanel(): void {

    this.panelDisplayed = !this.panelDisplayed;
    this.methodToShowFooter = this.panelDisplayed ? 'button' : 'map'; 
       
  }

}
