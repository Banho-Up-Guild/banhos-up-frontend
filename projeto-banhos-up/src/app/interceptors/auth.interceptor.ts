import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Só adiciona o token nas requisições feitas para o nosso backend.
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Verifica se a sessão ainda é válida.
  if (!authService.estaAutenticado()) {
    return next(req);
  }

  const token = authService.tokenAtual();

  if (!token) {
    return next(req);
  }

  // Envia o JWT no cabeçalho Authorization.
  const requisicaoAutenticada = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(requisicaoAutenticada);
};