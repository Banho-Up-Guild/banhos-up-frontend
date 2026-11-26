import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const customerGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se não estiver autenticado, encaminha para o login
  // e guarda a rota que o usuário tentou acessar.
  if (!authService.estaAutenticado()) {
    return router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }

  // Somente CUSTOMER pode acessar essas páginas.
  if (authService.usuarioAtual()?.role === 'CUSTOMER') {
    return true;
  }

  // Funcionários e administradores devem acessar o painel.
  if (authService.ehFuncionarioOuAdmin()) {
    return router.createUrlTree(['/funcionario/painel']);
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};