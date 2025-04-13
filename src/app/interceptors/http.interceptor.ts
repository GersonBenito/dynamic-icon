import { HttpInterceptorFn } from '@angular/common/http';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(`[${req.method}][${req.url}]`);
  return next(req);
};
