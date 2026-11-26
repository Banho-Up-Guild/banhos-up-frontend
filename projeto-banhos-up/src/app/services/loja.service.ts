import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Loja, LojaRequest } from '../models/loja.model';
import { Profissional } from '../models/agendamento.model';

@Injectable({
  providedIn: 'root'
})
export class LojaService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/lojas`;

  // LISTAR LOJAS
  listarLojas(somenteAtivas: boolean = true): Observable<Loja[]> {

    const params = new HttpParams()
      .set('somenteAtivas', String(somenteAtivas));

    return this.http.get<Loja[]>(
      this.apiUrl,
      { params }
    );
  }

  // BUSCAR UMA LOJA PELO ID
  buscarPorId(id: number): Observable<Loja> {

    return this.http.get<Loja>(
      `${this.apiUrl}/${id}`
    );
  }

  // LISTAR FUNCIONÁRIOS DE UMA LOJA
  listarFuncionariosPorLoja(idStore: number): Observable<Profissional[]> {

    const params = new HttpParams()
      .set('idStore', String(idStore));

    return this.http.get<Profissional[]>(
      `${environment.apiUrl}/users/store_employee`,
      { params }
    );
  }

  // ADMIN: listar todas as unidades, inclusive inativas
  listarTodasUnidadesAdmin(): Observable<Loja[]> {
    return this.http.get<Loja[]>(
      `${environment.apiUrl}/admin/lojas`
    );
  }

  // EMPLOYEE: consultar somente sua própria unidade
  buscarMinhaUnidade(): Observable<Loja> {
    return this.http.get<Loja>(
      `${environment.apiUrl}/employee/me/store`
    );
  }

  // ADMIN: cadastrar unidade.
  criarUnidade(request: LojaRequest): Observable<Loja> {

    return this.http.post<Loja>(
      this.apiUrl,
      request
    );
  }

  // ADMIN: editar unidade.
  atualizarUnidade(
    id: number,
    request: LojaRequest
  ): Observable<Loja> {

    return this.http.put<Loja>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  // EMPLOYEE: editar somente a própria unidade.
  atualizarMinhaUnidade(request: LojaRequest): Observable<Loja> {

    return this.http.put<Loja>(
      `${environment.apiUrl}/employee/me/store`,
      request
    );
  }

  // ADMIN: ativar ou desativar unidade.
  alterarStatusUnidade(
    id: number,
    ativa: boolean
  ): Observable<Loja> {

    const params = new HttpParams()
      .set('ativa', String(ativa));

    return this.http.patch<Loja>(
      `${this.apiUrl}/${id}/status`,
      {},
      { params }
    );
  }

}