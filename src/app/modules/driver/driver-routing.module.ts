import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OffersRequestComponent } from './components/offers-request/offers-request.component';

const routes: Routes = [

  {
    path: '',
    children: [
      {
        path: 'offers-request', 
        component: OffersRequestComponent
      }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule { }
