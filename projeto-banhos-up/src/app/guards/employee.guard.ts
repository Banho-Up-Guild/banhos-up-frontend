import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

export const employeeGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Se não estiver autenticado, encaminha para o login.
  if (!authService.estaAutenticado()) {
    return router.createUrlTree(['/login']);
  }

  // Funcionário e administrador podem entrar na área.
  if (authService.ehFuncionarioOuAdmin()) {
    return true;
  }

  // Clientes não podem acessar essa área.
  return router.createUrlTree(['/']);
};