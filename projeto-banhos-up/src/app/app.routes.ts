import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'BanhosUp! | Home',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'agendamento',
    title: 'BanhosUp! | Agendamento',
    loadComponent: () =>
      import('./pages/agendamento/agendamento').then((m) => m.Agendamento),
  },
  {
    path: 'cadastro',
    title: 'BanhosUp! | Cadastro',
    loadComponent: () =>
      import('./pages/cadastro/cadastro').then((m) => m.Cadastro),
  },
  {
  path: 'login',
  title: 'BanhosUp! | Login',
  loadComponent: () =>
    import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
