import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

import {
  AppointmentManagement,
  AppointmentFilters
} from '../models/funcionario-agendamento.model';

import { StatusAgendamento } from '../models/agendamento.model';

interface MinhasPermissoesResponse {
  employeeId: number;
  employeeName: string;
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})

export class FuncionarioAgendamentoService {

  private readonly http = inject(HttpClient);

  private readonly funcionarioUrl =
    `${environment.apiUrl}/employee/me/appointments`;

  private readonly adminUrl =
    `${environment.apiUrl}/admin/appointments`;


  private criarParametros(
    filtros?: AppointmentFilters
  ): HttpParams {

    let params = new HttpParams();

    if (filtros?.startDate) {
      params = params.set('startDate', filtros.startDate);
    }

    if (filtros?.endDate) {
      params = params.set('endDate', filtros.endDate);
    }

    if (filtros?.status) {
      params = params.set('status', filtros.status);
    }

    return params;
  }


  listarFuncionario(
    filtros?: AppointmentFilters
  ): Observable<AppointmentManagement[]> {

    return this.http.get<AppointmentManagement[]>(
      this.funcionarioUrl,
      { params: this.criarParametros(filtros) }
    );
  }


  listarSolicitacoesFuncionario():
    Observable<AppointmentManagement[]> {

    return this.http.get<AppointmentManagement[]>(
      `${this.funcionarioUrl}/requests`
    );
  }


  listarAdmin(
    filtros?: AppointmentFilters
  ): Observable<AppointmentManagement[]> {

    return this.http.get<AppointmentManagement[]>(
      this.adminUrl,
      { params: this.criarParametros(filtros) }
    );
  }


  listarSolicitacoesAdmin():
    Observable<AppointmentManagement[]> {

    return this.http.get<AppointmentManagement[]>(
      `${this.adminUrl}/requests`
    );
  }


  confirmarFuncionario(id: number):
    Observable<AppointmentManagement> {

    return this.http.patch<AppointmentManagement>(
      `${this.funcionarioUrl}/${id}/confirm`,
      {}
    );
  }


  recusarFuncionario(id: number):
    Observable<AppointmentManagement> {

    return this.http.patch<AppointmentManagement>(
      `${this.funcionarioUrl}/${id}/reject`,
      {}
    );
  }


  atualizarStatusAdmin(
    id: number,
    status: StatusAgendamento
  ): Observable<AppointmentManagement> {

    return this.http.patch<AppointmentManagement>(
      `${this.adminUrl}/${id}/status`,
      { status }
    );
  }


  confirmarAdmin(id: number):
    Observable<AppointmentManagement> {

    return this.atualizarStatusAdmin(id, 'CONFIRMED');
  }


  recusarAdmin(id: number):
    Observable<AppointmentManagement> {

    return this.atualizarStatusAdmin(id, 'CANCELED');
  }

  buscarMinhasPermissoes():
  Observable<MinhasPermissoesResponse> {

  return this.http.get<MinhasPermissoesResponse>(
    `${environment.apiUrl}/employee/me/permissions`
  );
}

}