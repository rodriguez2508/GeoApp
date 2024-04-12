import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar-driver',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar-driver.component.html',
  styleUrl: './navbar-driver.component.scss'
})
export class NavbarDriverComponent {

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

  reload() {

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
      }
    });
  }
}
