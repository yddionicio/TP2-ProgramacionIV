import { HttpInterceptorFn } from '@angular/common/http';

export const credencialesInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
