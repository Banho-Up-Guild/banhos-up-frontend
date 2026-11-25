import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';

// Tipos de usuário existentes no backend
export type PerfilUsuario = 'CUSTOMER' | 'EMPLOYEE' | 'ADMIN';

// Estrutura dos dados do usuário retornados pelo backend
export interface UsuarioAutenticado {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: PerfilUsuario;
  active: boolean;
  registeredAt: string;
}

// Dados enviados para realizar o login
export interface LoginRequest {
  email: string;
  password: string;
}

// Resposta retornada pelo endpoint /auth/login
export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresInMs: number;
  user: UsuarioAutenticado;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'banhosup_token';
  private readonly USER_KEY = 'banhosup_user';
  private readonly EXPIRATION_KEY = 'banhosup_expiration';

  constructor(private readonly http: HttpClient) {}

  // Dados da sessão atual
  readonly usuarioAtual = signal<UsuarioAutenticado | null>(
    this.carregarUsuario()
  );

  readonly tokenAtual = signal<string | null>(
    this.carregarToken()
  );

  private readonly expiracao = signal<number | null>(
    this.carregarExpiracao()
  );

  // Realiza o login no backend
  login(dados: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${environment.apiUrl}/auth/login`,
        dados
      )
      .pipe(
        tap((resposta) => {
          this.salvarSessao(resposta);
        })
      );
  }

  // Salva os dados recebidos do backend
  private salvarSessao(resposta: LoginResponse): void {
    const dataExpiracao = Date.now() + resposta.expiresInMs;

    this.tokenAtual.set(resposta.token);
    this.usuarioAtual.set(resposta.user);
    this.expiracao.set(dataExpiracao);

    try {
      sessionStorage.setItem(this.TOKEN_KEY, resposta.token);
      sessionStorage.setItem(
        this.USER_KEY,
        JSON.stringify(resposta.user)
      );
      sessionStorage.setItem(
        this.EXPIRATION_KEY,
        String(dataExpiracao)
      );
    } catch {
      // A sessão continuará disponível em memória
      // mesmo se o navegador bloquear o armazenamento.
    }
  }

  // Verifica se existe uma sessão válida
  estaAutenticado(): boolean {
    const token = this.tokenAtual();
    const dataExpiracao = this.expiracao();

    if (!token || !dataExpiracao) {
      return false;
    }

    if (Date.now() >= dataExpiracao) {
      this.logout();
      return false;
    }

    return true;
  }

  // Verifica se o usuário é funcionário ou administrador
  ehFuncionarioOuAdmin(): boolean {
    if (!this.estaAutenticado()) {
      return false;
    }

    const perfil = this.usuarioAtual()?.role;

    return perfil === 'EMPLOYEE' || perfil === 'ADMIN';
  }

  // Encerra a sessão
  logout(): void {
    this.tokenAtual.set(null);
    this.usuarioAtual.set(null);
    this.expiracao.set(null);

    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.EXPIRATION_KEY);
    } catch {
      // Não há armazenamento disponível para limpar.
    }
  }

  // Recupera o token salvo no navegador
  private carregarToken(): string | null {
    try {
      return sessionStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  // Recupera os dados do usuário salvos no navegador
  private carregarUsuario(): UsuarioAutenticado | null {
    try {
      const dados = sessionStorage.getItem(this.USER_KEY);

      return dados ? JSON.parse(dados) as UsuarioAutenticado : null;
    } catch {
      return null;
    }
  }

  // Recupera a data de expiração do token
  private carregarExpiracao(): number | null {
    try {
      const valor = sessionStorage.getItem(this.EXPIRATION_KEY);

      if (!valor) {
        return null;
      }

      const data = Number(valor);

      return Number.isFinite(data) ? data : null;
    } catch {
      return null;
    }
  }
}