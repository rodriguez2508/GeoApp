import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {

  if(req.url.startsWith('/api')){

    console.log('Interceptor: => ',req.url)
    // const apiReq = req.clone({
 
    //   setHeaders: {
    //     // 'ngsw-bypass': 'true'
    //   },
    // });

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'ngsw-bypass': 'true'
      })
    };
  
    const authReq = req.clone({
      headers: httpOptions.headers
    });
    

    return next(authReq);

  }
  
  return next(req);


};
