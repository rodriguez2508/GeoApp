import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

// --interfaces
import { I_ConnectedUser } from '../../../../../interface/user.interface';
// --interfaces
@Component({
  selector: 'app-p-usersonline',
  standalone: true,
  imports: [],
  templateUrl: './p-usersonline.component.html',
  styleUrl: './p-usersonline.component.scss'
})
export class PUsersonlineComponent implements OnChanges, AfterViewInit {


  @Input() connected_users: I_ConnectedUser[] = [];
  @Input() connected_TravelerUsers: I_ConnectedUser[] = [];
  @Input() connected_DriverUsers: I_ConnectedUser[] = [];

  constructor(){

  }
  ngOnChanges(changes: SimpleChanges): void {
    
  }
  ngAfterViewInit(): void {
    
  }
  

}
