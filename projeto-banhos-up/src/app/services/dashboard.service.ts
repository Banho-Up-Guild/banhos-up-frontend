import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardResponse {
  agendamentosHoje: number;
  solicitacoesPendentes: number;
  servicosCadastrados: number;
  membrosEquipe: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  buscarResumoFuncionario(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(
      `${environment.apiUrl}/employee/me/dashboard`
    );
  }

  buscarResumoAdmin(storeId?: number | null): Observable<DashboardResponse> {
    let params = new HttpParams();

    if (storeId != null) {
      params = params.set('storeId', String(storeId));
    }

    return this.http.get<DashboardResponse>(
      `${environment.apiUrl}/admin/dashboard`,
      { params }
    );
  }
}
