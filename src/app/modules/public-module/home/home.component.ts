import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  appName: string = environment.appName;
  title_page: string = 'Bienvenido a ' + this.appName;

  constructor(
    private route: ActivatedRoute, 
    private router: Router) {}

  goToTravelerLogin(): void {
    // this.router.navigate(['/session/signin'], { queryParams: { role: 'traveler' } });
    // window.location.assign('/session/signin?role=traveler');
    this.router.navigate(['/session/signin'], { 
      queryParams: {
        role: 'traveler',
      },
    });
  }

  goToDriverLogin(): void {
   
    this.router.navigate(['/session/signin'], {
      queryParams: {
        role: 'driver',
      },
    });
  }
}
