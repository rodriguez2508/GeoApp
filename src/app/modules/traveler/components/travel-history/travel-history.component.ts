import { Component } from '@angular/core';
import { I_UserSessionStorage } from '../../../../interface/user.interface';
import { HistoryPageComponent } from './history-page/history-page.component';
import { PendingPageComponent } from './pending-page/pending-page.component';
import { OngoingPageComponent } from './ongoing-page/ongoing-page.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-travel-history',
  standalone: true,
  imports: [HistoryPageComponent, OngoingPageComponent, PendingPageComponent],
  templateUrl: './travel-history.component.html',
  styleUrl: './travel-history.component.scss'
})
export class TravelHistoryComponent {
  
  
  userData: I_UserSessionStorage = { 
    id: '',
    ci: '',
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone: '',
    user_type: ''
   };

  user_type: string = '';
  viewToShow: string = 'map';

  constructor(
    private route: ActivatedRoute,
  ){

    // obtengo el parametro en la ruta
    this.route.queryParams.subscribe(params => {

      // -------------------------------------------
     // -- verifica parametros en la ruta  
     // ------------------------------------------- 
     this.viewToShow = params['view']? params['view'] : 'pending'; 
    
   });

  }


}
