import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ServicoResponse } from '../models/agendamento.model';

@Injectable({
  providedIn: 'root'
})
export class ServicoService {

  private readonly http = inject(HttpClient);

  listarAtivos(): Observable<ServicoResponse[]> {
    const params = new HttpParams().set('ativos', 'true');
    return this.http.get<ServicoResponse[]>(
      `${environment.apiUrl}/offerings`,
      { params }
    );
  }
}
