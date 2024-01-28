import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SectionMapComponent } from './section-map/section-map.component';
import { NotfoundComponent } from '../public/notfound/notfound.component';

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
