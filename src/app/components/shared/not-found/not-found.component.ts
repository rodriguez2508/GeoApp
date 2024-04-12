import { Component } from '@angular/core';
import { Router } from '@angular/router';
  
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})

export class NotFoundComponent {
  constructor(private _router: Router) {}

  goBackByUrl() {
    window.history.back();
  }
  goHomeByUrl() {
    this._router.navigateByUrl('public/panel');
  }
}
