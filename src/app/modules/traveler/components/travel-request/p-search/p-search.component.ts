import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FavoritesPlacesService } from './../../../../../services/map/favorites-places.service';
import { DataService } from '../../../../../services/data/data.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { I_Places } from '../../../../../interface/places.interface';

// --interfaces

// --interfaces
@Component({
  selector: 'app-p-search',
  standalone: true,
  imports: [],
  templateUrl: './p-search.component.html',
  styleUrl: './p-search.component.scss'
})
export class PSearchComponent implements OnChanges, AfterViewInit {
 
  private _snackBar = inject(MatSnackBar)
  
  @Input() address: string = '';  
  @Input() distance: string = '0';  
  @Output() footerDisplayed = new EventEmitter<boolean>(false);

  @Input() favoriteMarkers:I_Places[] = [];

  constructor(
    private dataService: DataService,
    
  ){

     
  }
  ngOnChanges(changes: SimpleChanges): void {
    
  }
  ngAfterViewInit(): void {

    console.log(this.favoriteMarkers)
    
  }
   
  onSubmit(){

  }

  hideFooter(){
    this.footerDisplayed.emit(false);
  }
 
}
