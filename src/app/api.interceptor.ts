import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {

  if(req.url.startsWith('/api')){

    console.log('Interceptor: => ',req.url)
    const apiReq = req.clone({
 
      setHeaders: {'ngsw-bypass': 'true'},
    });

    return next(apiReq);

  }
  
  return next(req);


};
