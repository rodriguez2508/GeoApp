import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar-traveler.component';

@Component({
  selector: 'app-travel-history',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './travel-history.component.html',
  styleUrl: './travel-history.component.scss'
})
export class TravelHistoryComponent {

}
