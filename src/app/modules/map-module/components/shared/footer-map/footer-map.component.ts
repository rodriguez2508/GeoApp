import { Component, Input, OnInit } from '@angular/core';
import { PUsersonlineComponent } from '../p-usersonline/p-usersonline.component';

// -- services
import { GeolocService } from '../../../../../services/geolocation/geoloc.service';
import { DataService } from '../../../../../services/data/data.service';
// -- services
// -- interface
import { I_UserMap } from '../../../../../interface/user.interface';
// -- interface

@Component({
  selector: 'app-footer-map',
  standalone: true,
  imports: [PUsersonlineComponent],
  templateUrl: './footer-map.component.html',
  styleUrl: './footer-map.component.scss'
})
export class FooterMapComponent implements OnInit {
 
  @Input() connected_users: I_UserMap[] = [];  
 
  connected_users_lenght: number = 0;

  userLoginOn: boolean = false;

  showPanel = false;


  private connectedUsers: { [id: string]: any } = {};  

  constructor(private geolocService: GeolocService, private dataService:DataService, ){
    
  }

  mostrarPanel(): void {
    this.showPanel = !this.showPanel;
  }

  ngOnInit(): void {

     

   
    
  }
}
