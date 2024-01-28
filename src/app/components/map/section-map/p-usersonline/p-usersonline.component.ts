import { Component, Input } from '@angular/core';
import { connectedUsers } from '../../../../interface/connectedUsers.interface';

@Component({
  selector: 'app-p-usersonline',
  standalone: true,
  imports: [],
  templateUrl: './p-usersonline.component.html',
  styleUrl: './p-usersonline.component.scss'
})
export class PUsersonlineComponent {

  @Input() conected_users: connectedUsers[] = []; 
  
  
   
}
