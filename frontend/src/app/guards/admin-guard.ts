import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { catchError, map, of } from 'rxjs';
import { Sesion } from '../services/sesion';
import { ModalMensaje } from '../shared/modal-mensaje/modal-mensaje';

export const adminGuard: CanActivateFn = () => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  const dialog = inject(MatDialog);

  const denegar = () => {
    dialog.open(ModalMensaje, {
      data: {
        titulo: 'Acceso denegado',
        mensaje: 'No tenés permiso para ver esta sección',
      },
    });
    return router.createUrlTree(['/publicaciones']);
  };

  if (sesion.usuario()) {
    return sesion.esAdmin() ? true : denegar();
  }

  return sesion.autorizar().pipe(
    map(() => (sesion.esAdmin() ? true : denegar())),
    catchError(() => of(denegar())),
  );
};
