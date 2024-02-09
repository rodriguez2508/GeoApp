import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

// --interfaces
import { I_ConnectedUser } from '../../../../../interface/user.interface';
// --interfaces
@Component({
  selector: 'app-p-map',
  standalone: true,
  imports: [],
  templateUrl: './p-map.component.html',
  styleUrl: './p-map.component.scss'
})
export class PMapComponent implements OnChanges, AfterViewInit {

  @Input() connected_users: I_ConnectedUser[] = [];
  @Input() connected_TravelerUsers: I_ConnectedUser[] = [];
  @Input() connected_DriverUsers: I_ConnectedUser[] = [];
  
  @Input() address: string = 'Buscando...';  
  @Input() distance: string = '0';  

  constructor(){
  }
  ngOnChanges(changes: SimpleChanges): void {
    
  }
  ngAfterViewInit(): void {
    
  }
  

}
