import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from './services/storage/storage.service';
 

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {

  const storageService = inject(StorageService);

  const token = storageService.f_getToken() ? storageService.f_getToken() : '';

  const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })
  };

  const authReq = req.clone({
    headers: httpOptions.headers
  });
  

  // const authReq = req.clone({

  //   headers: req.headers.set('Authorization', 'Bearer ' + token),
  // });
  return next(authReq);
};
