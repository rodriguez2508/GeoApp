import { Component, Input, OnInit } from '@angular/core';
import { PUsersonlineComponent } from '../p-usersonline/p-usersonline.component';
import { GeolocService } from '../../../../services/geoloc.service';
import { DataService } from '../../../../services/data.service';
import { connectedUsers } from '../../../../interface/connectedUsers.interface';

@Component({
  selector: 'app-footer-map',
  standalone: true,
  imports: [PUsersonlineComponent],
  templateUrl: './footer-map.component.html',
  styleUrl: './footer-map.component.scss'
})
export class FooterMapComponent implements OnInit {
 
  @Input() conected_users: connectedUsers[] = [];  
 
  conected_users_lenght: number = 0;

  userLoginOn: boolean = false;

  showPanel = false;


  private connectedUsers: { [id: string]: any } = {};  

  constructor(private geolocService: GeolocService, private dataService:DataService, ){
    
  }

  mostrarPanel(): void {
    this.showPanel = !this.showPanel;
  }

  ngOnInit(): void {

    // -- para verificar si el usuario tiene la sesion activa
    this.dataService.getUserLoggedIn().subscribe((value) => {
      this.userLoginOn = value;
      
    });

   
    
  }
}
