
import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  CriarAgendamentoRequest,
  AgendamentoResponse,
  ProfissionalDisponivelResponse
} from '../models/agendamento.model';

import { DisponibilidadeCalendarioResponse } from '../models/disponibilidade.model';

@Injectable({
  providedIn: 'root'
})
export class AgendamentoApiService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/appointments`;

  criarAgendamento(
    dados: CriarAgendamentoRequest
  ): Observable<AgendamentoResponse> {

    return this.http.post<AgendamentoResponse>(
      this.apiUrl,
      dados
    );

  }

  listarDisponibilidade(
    yearMonth: string,
    storeId: number,
    durationMinutes: number,
    employeeId: number
  ): Observable<DisponibilidadeCalendarioResponse[]> {

    const params = new HttpParams()
      .set('storeId', String(storeId))
      .set('yearMonth', yearMonth)
      .set('durationMinutes', String(durationMinutes))
      .set('employeeId', String(employeeId));

    return this.http.get<DisponibilidadeCalendarioResponse[]>(
      `${environment.apiUrl}/availability/calendar`,
      { params }
    );

  }

  recomendarProfissional(
    storeId: number,
    dateTime: string,
    durationMinutes: number,
    employeeId: number
  ): Observable<ProfissionalDisponivelResponse> {
    const params = new HttpParams()
      .set('storeId', String(storeId))
      .set('dateTime', dateTime)
      .set('durationMinutes', String(durationMinutes))
      .set('employeeId', String(employeeId));

    return this.http.get<ProfissionalDisponivelResponse>(
      `${environment.apiUrl}/availability/employee`,
      { params }
    );
  }

}
