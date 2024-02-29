import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TravelRequestComponent } from './components/travel-request/travel-request.component';   
import { TravelAlertsComponent } from './components/travel-alerts/travel-alerts.component';
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
        path: 'travel-alerts', 
        component: TravelAlertsComponent
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
