import { SessionService } from './services/session/session.service';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';



export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const sessionService = inject(SessionService);


  return next(req).pipe(catchError((error) => {

    if ([401, 403].includes(error.status)) {
      console.log('Unauthorized request');
      sessionService.signout();
    } else if ([404].includes(error.status)) {

      console.log('Not found request');

    }
     
    console.log(error.message);

    return throwError(() => error);
  }));
};
