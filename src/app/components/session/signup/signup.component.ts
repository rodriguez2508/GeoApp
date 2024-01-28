import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
 
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {

  title_page: string = "Crear Cuenta";

  constructor(private router: Router) {}

  @ViewChild('form') form: NgForm | undefined; // Reemplaza 'form' con el nombre de tu formulario
  @ViewChild('input') input: ElementRef | undefined; // Reemplaza 'input' con el nombre de tu campo de entrada

  
  onSubmit() {
    const name = this.input?.nativeElement.value;
    if (name) {
      // this.localStorage.setItem('name', name).subscribe(() => {
      //   this.router.navigate(['/map']);
      // });
    }
  }

}
