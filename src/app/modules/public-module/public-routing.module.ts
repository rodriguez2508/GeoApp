import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';


const routes: Routes = [

  {
    path: '',
    children: [
      {
        path: 'home', 
        component: HomeComponent
      },
      
    {
      path: '',
      redirectTo: 'public/home',
      pathMatch: 'full'
  },
    ]
  } 


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
