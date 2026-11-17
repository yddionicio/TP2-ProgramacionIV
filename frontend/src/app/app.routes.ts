import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'cargando', pathMatch: 'full' },
  {
    path: 'cargando',
    loadComponent: () => import('./pages/cargando/cargando').then((m) => m.Cargando),
  },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  {
    path: 'publicaciones',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/publicaciones/publicaciones').then((m) => m.Publicaciones),
  },
  {
    path: 'publicaciones/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/detalle-publicacion/detalle-publicacion').then((m) => m.DetallePublicacion),
  },
  {
    path: 'ranking',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/ranking/ranking').then((m) => m.Ranking),
  },
  {
    path: 'mi-perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
  },
  { path: '**', redirectTo: 'cargando' },
];
