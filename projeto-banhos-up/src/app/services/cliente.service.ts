import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface CadastroClienteRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  secondaryPhone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
}

export interface CadastroClienteResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'CUSTOMER';
  active: boolean;
  registeredAt: string;
}

export interface PerfilClienteResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  secondaryPhone: string | null;
  cpf: string;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
  role: 'CUSTOMER';
  active: boolean;
  registeredAt: string;
}

export interface AtualizarPerfilClienteRequest {
  name: string;
  phone: string;
  secondaryPhone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
}

export interface AlterarSenhaRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/users`;

  cadastrar(
    dados: CadastroClienteRequest
  ): Observable<CadastroClienteResponse> {
    return this.http.post<CadastroClienteResponse>(
      `${this.usersUrl}/register`,
      dados
    );
  }

  buscarMeuPerfil(): Observable<PerfilClienteResponse> {
    return this.http.get<PerfilClienteResponse>(
      `${this.usersUrl}/me/profile`
    );
  }

  atualizarMeuPerfil(
    dados: AtualizarPerfilClienteRequest
  ): Observable<PerfilClienteResponse> {
    return this.http.put<PerfilClienteResponse>(
      `${this.usersUrl}/me/profile`,
      dados
    );
  }

  alterarMinhaSenha(
    dados: AlterarSenhaRequest
  ): Observable<void> {
    return this.http.put<void>(
      `${this.usersUrl}/me/password`,
      dados
    );
  }
}