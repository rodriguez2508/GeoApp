import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

// --components 
// --components
// -- Interfaces
import { I_UserMap, I_UserSessionStorage } from '../../../../../interface/user.interface';
// -- Interfaces
// -- services
import { GeolocService } from '../../../../../services/geolocation/geoloc.service';
import { DataService } from '../../../../../services/data/data.service';
import { Coordinate } from 'ol/coordinate';
import { I_Places } from '../../../../../interface/places.interface';
// -- services

@Component({
  selector: 'app-footer-page',
  standalone: true,
  imports: [],
  templateUrl: './footer-page.component.html',
  styleUrl: './footer-page.component.scss'
})
export class FooterPageComponent implements OnInit, OnChanges {

  @Input() connected_users: I_UserMap[] = [];
  @Input() methodToShowFooter: string = '';
  @Input() address: string = '';
  @Input() distance: string = '0';
  @Input() coord: Coordinate = [];
  @Input() coord_destination: Coordinate = [];
  connected_TravelerUsers: I_UserMap[] = [];
  connected_DriverUsers: I_UserMap[] = [];

  @Input() userData: I_UserSessionStorage = {
    id: '',
    ci: '',
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone: '',
    user_type: ''
  };
  @Input() favoriteMarkers: I_Places[] = [];

  userLoginOn: boolean = false;

  // @Output panelDisplayed = false;
  @Output() panelDisplayed = new EventEmitter<boolean>(false);
  @Output() placeSelected = new EventEmitter<string>();


  // private connectedUsers: { [id: string]: any } = {};  

  constructor(private geolocService: GeolocService, private dataService: DataService,) {

  }

  ngOnInit(): void {



  }

  ngOnChanges(changes: SimpleChanges): void {

    if ('connected_users' in changes) {
      this.getAndUpdateConnectedTravelerUsers();
      this.getAndUpdateConnectedDriverUsers();
    }
    if ('distance' in changes) {
      this.distance = parseFloat(this.distance) < 1 ? parseFloat(this.distance) * 1000 + ' m' : parseFloat(this.distance) + ' km';
    }



  }

  getConnectedUsersByType(userType: string): I_UserMap[] {
    // return this.connected_users.filter((user: I_UserMap) => user.type === userType);
    return this.connected_users;
  }

  getAndUpdateConnectedTravelerUsers(): void {
    this.connected_TravelerUsers = this.getConnectedUsersByType('traveler');
  }

  getAndUpdateConnectedDriverUsers(): void {
    this.connected_DriverUsers = this.getConnectedUsersByType('driver');
  }
  // showPanel(): void {

  //   this.panelDisplayed = !this.panelDisplayed;
  //   this.methodToShowFooter = this.panelDisplayed ? 'button' : 'map'; 

  // }
  hideFooter(event: boolean) {
    this.panelDisplayed.emit(event);
  }
  selectPlace(event: string) {
    console.log(event)
    this.placeSelected.emit(event);
  }

}
