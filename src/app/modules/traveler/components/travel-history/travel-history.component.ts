import { AfterViewInit, ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { I_UserSessionStorage } from '../../../../interface/user.interface';
import { HistoryPageComponent } from './history-page/history-page.component';
import { PendingPageComponent } from './pending-page/pending-page.component';
import { OngoingPageComponent } from './ongoing-page/ongoing-page.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-travel-history',
  standalone: true,
  imports: [HistoryPageComponent, OngoingPageComponent, PendingPageComponent],
  templateUrl: './travel-history.component.html',
  styleUrl: './travel-history.component.scss'
})
export class TravelHistoryComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {


  userData: I_UserSessionStorage = {
    id: '',
    ci: '',
    name: '',
    email: '',
    exp: 0,
    iat: 0,
    phone: '',
    user_type: ''
  };

  user_type: string = '';
  viewToShow: string = 'pending';

  constructor(
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {

    

    // obtengo el parametro en la ruta
    this.route.queryParams.subscribe(params => {

      // -------------------------------------------
      // -- verifica parametros en la ruta  
      // ------------------------------------------- 
      this.viewToShow = params['view'] ? params['view'] : 'pending';

    });

  }
  ngOnChanges(changes: SimpleChanges): void {

    if ('viewToShow' in changes) {

      this.changeDetectorRef.detectChanges();

    }
  }
  ngOnInit(): void {

    this.changeDetectorRef.detectChanges();

  }
  ngAfterViewInit(): void {

  }
  ngOnDestroy(): void {

  }




}
