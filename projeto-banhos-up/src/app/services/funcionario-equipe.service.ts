import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  FuncionarioEquipe,
  AlterarCargoRequest,
  CriarFuncionarioRequest
} from '../models/funcionario-equipe.model';

@Injectable({
  providedIn: 'root'
})
export class FuncionarioEquipeService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.apiUrl;

  // FUNCIONÁRIO: consultar a própria equipe.
  listarMinhaEquipe(): Observable<FuncionarioEquipe[]> {
    return this.http.get<FuncionarioEquipe[]>(
      `${this.baseUrl}/employee/me/team`
    );
  }

  // FUNCIONÁRIO: consultar funcionários disponíveis.
  listarDisponiveisMinhaEquipe(): Observable<FuncionarioEquipe[]> {
    return this.http.get<FuncionarioEquipe[]>(
      `${this.baseUrl}/employee/me/team/available`
    );
  }

  // FUNCIONÁRIO: adicionar à própria equipe.
  adicionarMinhaEquipe(employeeId: number):
    Observable<FuncionarioEquipe> {

    return this.http.post<FuncionarioEquipe>(
      `${this.baseUrl}/employee/me/team/${employeeId}`,
      {}
    );
  }

  // FUNCIONÁRIO: alterar cargo.
  atualizarCargoMinhaEquipe(
    employeeId: number,
    position: string
  ): Observable<FuncionarioEquipe> {

    const body: AlterarCargoRequest = { position };

    return this.http.patch<FuncionarioEquipe>(
      `${this.baseUrl}/employee/me/team/${employeeId}`,
      body
    );
  }

  // FUNCIONÁRIO: remover vínculo.
  removerMinhaEquipe(employeeId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/employee/me/team/${employeeId}`
    );
  }


  // ADMIN: consultar equipe de uma unidade.
  criarFuncionarioAdmin(
    storeId: number,
    request: CriarFuncionarioRequest
  ): Observable<FuncionarioEquipe> {
    return this.http.post<FuncionarioEquipe>(
      `${this.baseUrl}/admin/lojas/${storeId}/equipe/novo`,
      request
    );
  }

  listarEquipeAdmin(storeId: number): Observable<FuncionarioEquipe[]> {
    return this.http.get<FuncionarioEquipe[]>(
      `${this.baseUrl}/admin/lojas/${storeId}/equipe`
    );
  }

  // ADMIN: consultar disponíveis.
  listarDisponiveisAdmin(storeId: number):
    Observable<FuncionarioEquipe[]> {

    return this.http.get<FuncionarioEquipe[]>(
      `${this.baseUrl}/admin/lojas/${storeId}/equipe/disponiveis`
    );
  }

  // ADMIN: vincular funcionário.
  adicionarAdmin(
    storeId: number,
    employeeId: number
  ): Observable<FuncionarioEquipe> {

    return this.http.post<FuncionarioEquipe>(
      `${this.baseUrl}/admin/lojas/${storeId}/equipe/${employeeId}`,
      {}
    );
  }

  // ADMIN: alterar cargo.
  atualizarCargoAdmin(
    storeId: number,
    employeeId: number,
    position: string
  ): Observable<FuncionarioEquipe> {

    return this.http.patch<FuncionarioEquipe>(
      `${this.baseUrl}/admin/lojas/${storeId}/equipe/${employeeId}`,
      { position }
    );
  }

  // ADMIN: remover funcionário da equipe.
  removerAdmin(
    storeId: number,
    employeeId: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.baseUrl}/admin/lojas/${storeId}/equipe/${employeeId}`
    );
  }
}