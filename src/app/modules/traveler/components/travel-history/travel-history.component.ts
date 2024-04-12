import { AfterViewInit, ChangeDetectorRef, Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { I_UserSessionStorage } from '../../../../interface/user.interface';
import { HistoryPageComponent } from './history-page/history-page.component';
import { PendingPageComponent } from './pending-page/pending-page.component';
import { OngoingPageComponent } from './ongoing-page/ongoing-page.component';
import { ActivatedRoute } from '@angular/router';
import { SocketioServices } from '../../../../services/sockets/socketio.service';
import { environment } from '../../../../../environments/environment';
import { DataTravelerService } from '../../../../services/data/data_traveler.service';

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



  // --------------------------------------------------- 
  // TODO estado del socket INICIO 
  // ---------------------------------------------------

  socket_status$: boolean = true;
  socket: any;
  // ---------------------------------------------------
  // TODO estado del socket FINAL
  // ---------------------------------------------------


  constructor(
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private dataTravelerService: DataTravelerService,
    private socketioService: SocketioServices,

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


    // TODO -- Conexion al Socket 
    // -- Subscribirse al socketStatusService
    this.connectSocket();
    this.subscribeSocketStatus(); 

  }
  ngAfterViewInit(): void {

  }
  ngOnDestroy(): void {

    this.disconnectSocket();

  }



  // ---------------------------------------------------
  // TODO -- SOCKETS
  // ---------------------------------------------------

  connectSocket() {

    this.socket = this.socketioService.connectSocket(environment.socketUrl+'/status');
    
    this.socketioService.get_socketStatus(this.socket).subscribe(
      status => {
        this.dataTravelerService.setSocketStatus(status);
      }
    );

  }

  subscribeSocketStatus() {

    this.dataTravelerService.getSocketStatus().subscribe(data => {

      console.log('subscribeSocketStatus', data)
      if (data !== undefined) {
        this.socket_status$ = data;
      }

    });



  } 
  disconnectSocket() {
    if (this.socket) {

      this.socketioService.disconnectSocket(this.socket);
      this.dataTravelerService.setSocketStatus(false);

    }
  }


}
