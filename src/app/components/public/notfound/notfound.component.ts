import { Component } from '@angular/core';

import { Router } from '@angular/router';

@Component({
  selector: 'app-notfound',
  standalone: true,
  imports: [],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.scss'
})
export class NotfoundComponent {

  constructor(private _router: Router) {}

  goBackByUrl() {
    window.history.back();
  }
  goHomeByUrl() {
    this._router.navigateByUrl('public/home');
  }

}
