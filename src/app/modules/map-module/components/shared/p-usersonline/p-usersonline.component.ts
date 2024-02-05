import { Component, Input } from '@angular/core';


// --interface
import { I_ConnectedUser } from '../../../../../interface/user.interface';
// --interface
@Component({
  selector: 'app-p-usersonline',
  standalone: true,
  imports: [],
  templateUrl: './p-usersonline.component.html',
  styleUrl: './p-usersonline.component.scss'
})
export class PUsersonlineComponent {

  @Input() connected_users: I_ConnectedUser[] = []; 
  
  
   
}
