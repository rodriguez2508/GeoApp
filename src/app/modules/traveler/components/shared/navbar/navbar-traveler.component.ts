import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-navbar-traveler',
  standalone: true,
  imports: [],
  templateUrl: './navbar-traveler.component.html',
  styleUrl: './navbar-traveler.component.scss'
})
export class NavbarTravelerComponent {

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
  ){

  }

  goTo(route:string){

    this.router.navigate([route], { 
      queryParams: { }
    });
 
  }
}
