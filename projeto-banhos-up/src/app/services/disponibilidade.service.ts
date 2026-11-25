import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  DiaDisponibilidade,
  DisponibilidadeCalendarioResponse
} from '../models/disponibilidade.model';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadeService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;

  // FUNCIONÁRIO: consulta a disponibilidade da própria unidade.
  buscarMinhaDisponibilidade(): Observable<DiaDisponibilidade[]> {

    return this.http.get<DiaDisponibilidade[]>(
      `${this.apiUrl}/employee/me/availability`
    );
  }

  // FUNCIONÁRIO: salva a disponibilidade da própria unidade.
  salvarMinhaDisponibilidade(
    dias: DiaDisponibilidade[]
  ): Observable<DiaDisponibilidade[]> {

    return this.http.put<DiaDisponibilidade[]>(
      `${this.apiUrl}/employee/me/availability`,
      this.montarRequest(dias)
    );
  }

  // ADMIN: consulta disponibilidade de uma unidade.
  buscarDisponibilidadeAdmin(
    storeId: number
  ): Observable<DiaDisponibilidade[]> {

    return this.http.get<DiaDisponibilidade[]>(
      `${this.apiUrl}/admin/stores/${storeId}/availability`
    );
  }

  // ADMIN: salva disponibilidade de uma unidade.
  salvarDisponibilidadeAdmin(
    storeId: number,
    dias: DiaDisponibilidade[]
  ): Observable<DiaDisponibilidade[]> {

    return this.http.put<DiaDisponibilidade[]>(
      `${this.apiUrl}/admin/stores/${storeId}/availability`,
      this.montarRequest(dias)
    );
  }

  // CLIENTE: consulta os horários realmente disponíveis.
  buscarCalendario(
    storeId: number,
    yearMonth: string,
    durationMinutes: number,
    employeeId?: number | null
  ): Observable<DisponibilidadeCalendarioResponse[]> {

    let params = new HttpParams()
      .set('storeId', String(storeId))
      .set('yearMonth', yearMonth)
      .set('durationMinutes', String(durationMinutes));

    if (employeeId != null && employeeId > 0) {
      params = params.set('employeeId', String(employeeId));
    }

    return this.http.get<DisponibilidadeCalendarioResponse[]>(
      `${this.apiUrl}/availability/calendar`,
      { params }
    );
  }

  private montarRequest(dias: DiaDisponibilidade[]) {

    return {
      days: dias.map(dia => ({
        dayOfWeek: dia.dayOfWeek,
        closed: dia.closed,
        openingTime: dia.closed ? null : dia.openingTime,
        closingTime: dia.closed ? null : dia.closingTime,
        breakStart: dia.closed ? null : dia.breakStart,
        breakEnd: dia.closed ? null : dia.breakEnd
      }))
    };
  }
}