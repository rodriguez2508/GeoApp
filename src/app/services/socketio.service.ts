import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Observer, Subject, fromEvent, repeat, takeUntil } from 'rxjs';

import { Socket } from 'ngx-socket-io';
import { I_UserMap } from '../interface/user.interface';

// -- interfaces 
// -- interfaces
@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  public socketStatus: boolean = false;
  public usuario = null;

  private connectedUsersSubject: BehaviorSubject<I_UserMap[]> = new BehaviorSubject<I_UserMap[]>([]);
 
  private destroy$ = new Subject<void>();


  constructor(private socket: Socket) {

    // socket.connect(); 

  }

  connect() {
    // Conectar el socket
    this.socket.connect();
  }

  disconnect() {
    // Desconectar el socket
    this.socket.disconnect();
  }

  public get_socketStatus(): Observable<boolean> {

    return new Observable<boolean>((observer: Observer<boolean>) => {
      // Manejar el evento 'connect'
      const connectHandler = () => observer.next(true);
      this.socket.on('connect', connectHandler);
  
      // Manejar el evento 'disconnect'
      const disconnectHandler = () => observer.next(false);
      this.socket.on('disconnect', disconnectHandler);
  
  });
  }

  // -------------------------------------

  // Método para enviar datos del usuario al servidor
  public sendUserData(user: I_UserMap): Observable<any> {
    return this.socket.emit('send_user_data', { user });
    
  }
 

  public getConnectedUsers(): Observable<I_UserMap[]> {
    return new Observable<I_UserMap[]>((observer) => {
      this.socket.on('connected_users', (users: I_UserMap[]) => {
        observer.next(users);
      });

      // Enviar el evento de cierre cuando se destruya el observable
      return () => this.destroy$.next();
    });
    
  }

}
