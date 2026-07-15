import { Routes } from '@angular/router';
import { authGuard } from './Auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./Login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./Registration/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'board',
    loadComponent: () =>
      import('./Board/board').then((m) => m.BoardComponent),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'board', pathMatch: 'full' },
  { path: '**', redirectTo: 'board' },
];