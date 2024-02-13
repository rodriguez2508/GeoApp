import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionMapComponent } from './components/section-map/section-map.component';
import { NotfoundComponent } from '../public-module/notfound/notfound.component';

const routes: Routes = [

  {
    path: '',
    children: [
      {
        path: 'show', 
        component: SectionMapComponent
      },
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapRoutingModule { }
