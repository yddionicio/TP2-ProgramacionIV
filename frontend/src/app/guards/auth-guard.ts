import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Sesion } from '../services/sesion';

export const authGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);

  if (sesion.usuario()) return true;

  // Al recargar o ingresar directo, se autoriza con el servidor
  return sesion.autorizar().pipe(
    map((u) => (u ? true : router.createUrlTree(['/login']))),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
