import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { Sesion } from '../services/sesion';

export const authGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  if (sesion.usuario()) return true;
  // al recargar la página, la señal está vacía: se consulta la cookie al servidor
  return sesion.cargar().pipe(map((u) => (u ? true : router.createUrlTree(['/login']))));
};