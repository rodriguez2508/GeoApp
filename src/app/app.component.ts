import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { DataComponent } from './components/shared/data/data.component';
import { DataService } from './services/data.service';
import { SessionService } from './services/session.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DataComponent , NavbarComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit{
  
  title = 'Linki';
  userLoginOn: any;
  datosUsuario: any;

  constructor( 
    private dataService: DataService,
    private sessionService:SessionService
  ){}
  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    
  }
}
