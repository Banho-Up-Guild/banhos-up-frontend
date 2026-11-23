
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
    yearMonth: string
  ): Observable<CalendarioAgendamentoResponse[]> {

    const params = new HttpParams()
      .set('yearMonth', yearMonth);

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
