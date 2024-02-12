import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar-traveler.component';

@Component({
  selector: 'app-travel-offers',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './travel-offers.component.html',
  styleUrl: './travel-offers.component.scss'
})
export class TravelOffersComponent {

}
