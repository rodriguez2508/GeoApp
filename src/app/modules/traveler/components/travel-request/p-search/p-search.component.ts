import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

// --interfaces
import { I_ConnectedUser } from '../../../../../interface/user.interface';
// --interfaces
@Component({
  selector: 'app-p-search',
  standalone: true,
  imports: [],
  templateUrl: './p-search.component.html',
  styleUrl: './p-search.component.scss'
})
export class PSearchComponent implements OnChanges, AfterViewInit {
 
  
  @Input() address: string = '';  
  @Input() distance: string = '0';  

  constructor(){

     
  }
  ngOnChanges(changes: SimpleChanges): void {
    
  }
  ngAfterViewInit(): void {
    
  }
   
  onSubmit(){

  }
 
}
