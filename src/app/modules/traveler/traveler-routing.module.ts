import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TravelRequestComponent } from './components/travel-request/travel-request.component';
import { WaitingOffersComponent } from './components/waiting-offers/waiting-offers.component';
import { ConfirmOffersComponent } from './components/confirm-offers/confirm-offers.component';
import { RateDriverComponent } from './components/rate-driver/rate-driver.component';

const routes: Routes = [

  {
    path: '',
    children: [
      {
        path: 'travel-request', 
        component: TravelRequestComponent
      },
      {
        path: 'waiting-offers', 
        component: WaitingOffersComponent
      },
      {
        path: 'confirm-offers', 
        component: ConfirmOffersComponent
      },
      {
        path: 'rate-driver', 
        component: RateDriverComponent
      },
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TravelerRoutingModule { }
