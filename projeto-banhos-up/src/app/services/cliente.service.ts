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

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/users`;

  cadastrar(
    dados: CadastroClienteRequest
  ): Observable<CadastroClienteResponse> {

    return this.http.post<CadastroClienteResponse>(
      `${this.apiUrl}/register`,
      dados
    );
  }
}