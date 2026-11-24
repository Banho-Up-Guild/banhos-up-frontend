
import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  CalendarioAgendamentoResponse,
  CriarAgendamentoRequest,
  AgendamentoResponse
} from '../models/agendamento.model';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoApiService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/appointments`;

  // CONSULTAR CALENDÁRIO DE AGENDAMENTOS
  listarCalendario(
    yearMonth: string,
    idStore?: number | null,
    employeeId?: number | null
  ): Observable<CalendarioAgendamentoResponse[]> {

    let params = new HttpParams()
      .set('yearMonth', yearMonth);

    if (idStore !== null && idStore !== undefined) {
      params = params.set('idStore', String(idStore));
    }

    if (employeeId !== null && employeeId !== undefined) {
      params = params.set('employeeId', String(employeeId));
    }

    return this.http.get<CalendarioAgendamentoResponse[]>(
      `${this.apiUrl}/calendar`,
      { params }
    );
  }

  // CRIAR AGENDAMENTO BÁSICO
  // Este método corresponde ao DTO atual do backend.
  // Não está conectado ao botão de confirmação ainda.
  criarAgendamento(
    dados: CriarAgendamentoRequest
  ): Observable<AgendamentoResponse> {

    return this.http.post<AgendamentoResponse>(
      this.apiUrl,
      dados
    );

  }

}
