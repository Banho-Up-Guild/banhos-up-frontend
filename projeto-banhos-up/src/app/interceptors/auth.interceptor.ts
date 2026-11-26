import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);

  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Identifica as rotas públicas.
  const urlSemParametros = req.url.split('?')[0];

  const rotasPublicas = [
    `${environment.apiUrl}/auth/login`,
    `${environment.apiUrl}/users/register`
  ];

  // Remove qualquer Authorization antigo dessas requisições.
  if (rotasPublicas.includes(urlSemParametros)) {
    return next(
      req.clone({
        headers: req.headers.delete('Authorization')
      })
    );
  }

  // Rotas protegidas.
  if (!authService.estaAutenticado()) {
    return next(req);
  }

  const token = authService.tokenAtual();

  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  );
};