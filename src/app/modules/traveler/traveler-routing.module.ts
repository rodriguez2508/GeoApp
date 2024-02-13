import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TravelRequestComponent } from './components/travel-request/travel-request.component';   
import { TravelOffersComponent } from './components/travel-offers/travel-offers.component';
import { TravelHistoryComponent } from './components/travel-history/travel-history.component';

const routes: Routes = [

  {
    path: '',
    children: [
      {
        path: 'travel-request', 
        component: TravelRequestComponent
      },
      {
        path: 'travel-offers', 
        component: TravelOffersComponent
      },
      {
        path: 'travel-history', 
        component: TravelHistoryComponent
      }, 
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TravelerRoutingModule { }
