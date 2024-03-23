import { Component, Inject } from '@angular/core';
 
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import {MatButtonModule,} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { PMapComponent } from '../../../travel-request/p-map/p-map.component';

@Component({
  selector: 'app-add-favorites-places',
  standalone: true,
  imports: [MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,],
  templateUrl: './add-favorites-places.component.html',
  styleUrl: './add-favorites-places.component.scss'
})
export class AddFavoritesPlacesComponent {

  constructor(
    public dialogRef: MatDialogRef<PMapComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {name: string},
  ) {}
  
  onNoClick(): void {
    this.dialogRef.close();
  }

}
