import { Component } from '@angular/core';
import { DataService } from '../../../services/data/data.service';

@Component({
  selector: 'app-data',
  standalone: true,
  imports: [],
  templateUrl: './data.component.html',
  styleUrl: './data.component.scss'
})
export class DataComponent {

  constructor(public _dataS:DataService){

  }
  
}
