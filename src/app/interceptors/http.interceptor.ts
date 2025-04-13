import { HttpInterceptorFn } from '@angular/common/http';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(`[${req.method}][${req.url}]`);
  /*
    Todas las peticiones pasan por el interceptor 
    por lo que es necesario omitir el token en caso de que la url sea publico
    para el consumo de los assets
  */
  if(!req.url.includes('assets')){
    const token = 'YOUR_TOKEN';
  
    const reqClone = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return next(reqClone);
  }


  return next(req);
};
