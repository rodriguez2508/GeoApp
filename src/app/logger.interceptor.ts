import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from './services/storage/storage.service';
import { environment } from '../environments/environment';
 

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {

  const storageService = inject(StorageService);

  const token = storageService.f_getToken() ? storageService.f_getToken() : '';
  
  let httpOptions: any;

  if(req.url.startsWith(environment.socketUrl + '/api') && !req.url.startsWith(environment.socketUrl + '/api/v1/auth')){

    console.log('Interceptor: => ',req.url) 

    httpOptions = {
      headers: new HttpHeaders({
        'Cache-Control': 'no-cache',
        'ngsw-bypass': 'true',
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      })
    };
  
    const authReq = req.clone({
      headers: httpOptions.headers
    });
    

    return next(authReq);

  }else{
    httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      })
    };
  } 

  const authReq = req.clone({
    headers: httpOptions.headers
  });
  

  // const authReq = req.clone({

  //   headers: req.headers.set('Authorization', 'Bearer ' + token),
  // });
  return next(authReq);
};
