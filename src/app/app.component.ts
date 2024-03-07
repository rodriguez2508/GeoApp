import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { DataComponent } from './components/shared/data/data.component';
import { DataService } from './services/data/data.service';
import { SessionService } from './services/session/session.service';
import { I_UserSessionStorage } from './interface/user.interface';
import { StorageService } from './services/storage/storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DataComponent , NavbarComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
     
     
  ]
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy{
  
  title = 'Linki';
  
  subscriptionLoggedIn: Subscription;
  subscriptionUserData: Subscription;

  userLoginOn: boolean = false;
  userData: I_UserSessionStorage = {
    id: '',
    ci: '',
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone: '',
    type_user: ''
  };

  constructor( 
    private dataService: DataService,
    private sessionService:SessionService, 
    private storageService:StorageService,  
  ){

    this.subscriptionLoggedIn = this.dataService.loggedIn$.subscribe(value => {
      this.userLoginOn = value;
    });
  
    this.subscriptionUserData = this.dataService.userData$.subscribe(value => {
      this.userData = value;
    });

    
    
  }
  ngOnInit(): void {

   
    // this.userData = this.storageService.getUser();
    // this.userLoginOn = this.storageService.isLoggedIn();

    // console.log( this.userData)
  }

  ngAfterViewInit(): void {
    
     
    
  }

  ngOnDestroy() {
    if (this.subscriptionLoggedIn) {
      this.subscriptionLoggedIn.unsubscribe();
    }
  
    if (this.subscriptionUserData) {
      this.subscriptionUserData.unsubscribe();
    }
  }
 
}
