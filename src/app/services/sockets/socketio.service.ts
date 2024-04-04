import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Observer, Subject, fromEvent, repeat, takeUntil } from 'rxjs';

import { Socket } from 'ngx-socket-io';


// -- interfaces 
// -- interfaces
@Injectable({
  providedIn: 'root'
})
export class SocketioServices {

  public socketStatus: boolean = false; 
  


  constructor() { 
      
  }

  connectSocket(url:string) {

    const socket_status = new Socket(
      {
          url: url,
          options: {
              extraHeaders: {}
          }
      }
  );

  socket_status.connect( err => {
    
    console.log(err)
  }); 

  return socket_status;

  }

  disconnectSocket(socket: Socket) {
    socket.disconnect();
  }

  sendMessage(socket: Socket, message: string) {
    socket.emit('message', message);
  }

  receiveMessage(socket: Socket) {
    return socket.fromEvent('message');
  }

  public get_socketStatus(socket: Socket): Observable<boolean> {

    return new Observable<boolean>((observer: Observer<boolean>) => {
      // Manejar el evento 'connect'
      const connectHandler = () => observer.next(true);
      socket.on('connect', connectHandler);
  
      // Manejar el evento 'disconnect'
      const disconnectHandler = () => observer.next(false);
      socket.on('disconnect', disconnectHandler);
  
  });
  }

  // -------------------------------------

  // // Método para enviar datos del usuario al servidor
  // public sendUserData(user: I_UserMap): Observable<any> {
  //   return this.socket.emit('send_user_data', { user });
  //   // return this.socket.emit('send_user_data', { user });
    
  // }
 

  // public getConnectedUsers(): Observable<I_UserMap[]> {
  //   return new Observable<I_UserMap[]>((observer) => {
  //     // this.socket.on('connected_users', (users: I_UserMap[]) => {
  //     //   observer.next(users);
  //     // });

  //     // // Enviar el evento de cierre cuando se destruya el observable
  //     // return () => this.destroy$.next();
  //   });
    
  // }

}
