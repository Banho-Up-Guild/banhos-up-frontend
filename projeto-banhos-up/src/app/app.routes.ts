import { Routes } from '@angular/router';
import { employeeGuard } from './guards/employee.guard';
import { customerGuard } from './guards/customer.guard';

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
    canActivate: [customerGuard],
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
    path: 'perfil',
    title: 'BanhosUp! | Meu Perfil',
    canActivate: [customerGuard],
    loadComponent: () =>
      import('./pages/perfil/perfil').then((m) => m.Perfil),
    children: [
      {
        path: '',
        redirectTo: 'meus-dados',
        pathMatch: 'full',
      },
      {
        path: 'meus-dados',
        title: 'BanhosUp! | Meus Dados',
        loadComponent: () =>
          import('./pages/perfil/componentes/meus-dados/meus-dados')
            .then((m) => m.MeusDados),
      },
      {
        path: 'agendamentos',
        title: 'BanhosUp! | Meus Agendamentos',
        loadComponent: () =>
          import('./pages/perfil/componentes/meus-agendamentos/meus-agendamentos')
            .then((m) => m.MeusAgendamentos),
      },
      {
        path: 'pets',
        title: 'BanhosUp! | Meus Pets',
        loadComponent: () =>
          import('./pages/perfil/componentes/meus-pets/meus-pets')
            .then((m) => m.MeusPets),
      },
      {
        path: 'alterar-senha',
        title: 'BanhosUp! | Alterar Senha',
        loadComponent: () =>
          import('./pages/perfil/componentes/alterar-senha/alterar-senha')
            .then((m) => m.AlterarSenha),
      },
    ],
  },
  {
    path: 'funcionario',
    pathMatch: 'full',
    redirectTo: 'funcionario/painel',
  },
  {
    path: 'funcionario/:modulo',
    title: 'BanhosUp! | Área do Funcionário',
    canActivate: [employeeGuard],
    loadComponent: () =>
      import('./pages/funcionario/funcionario')
        .then((m) => m.Funcionario),
  },
  {
    path: 'termos',
    title: 'BanhosUp! | Termos e Condições',
    loadComponent: () =>
      import('./pages/termos/termos')
        .then((m) => m.TermosCondicoesComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];