import { HttpHeaders, HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../environments/environment';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  
  
  console.log('Interceptor: => ',req.url )
  console.log('Interceptor auth: => ',req.url.startsWith(environment.socketUrl + '/api/v1/auth') )

  if(req.url.startsWith(environment.socketUrl + '/api') ){

    console.log('Interceptor: => ',req.url)
    // const apiReq = req.clone({
 
    //   setHeaders: {
    //     // 'ngsw-bypass': 'true'
    //   },
    // });

    const httpOptions = {
      headers: new HttpHeaders({
        // 'Cache-Control': 'no-cache',
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
