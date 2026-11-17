import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { catchError, throwError } from 'rxjs';
import { Sesion } from '../services/sesion';
import { ModalMensaje } from '../shared/modal-mensaje/modal-mensaje';

let modalVencimientoAbierto = false;

export const credencialesInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  const dialog = inject(MatDialog);

  return next(req.clone({ withCredentials: true })).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/autorizar')
      ) {
        sesion.limpiar();
        sesion.detenerTemporizador();
        router.navigate(['/login']);

        if (!modalVencimientoAbierto) {
          modalVencimientoAbierto = true;
          dialog
            .open(ModalMensaje, {
              data: {
                titulo: 'Sesión vencida',
                mensaje: 'Tu sesión venció. Iniciá sesión de nuevo.',
              },
            })
            .afterClosed()
            .subscribe(() => {
              modalVencimientoAbierto = false;
            });
        }
      }
      return throwError(() => error);
    }),
  );
};
