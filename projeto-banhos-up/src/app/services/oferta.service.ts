import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Oferta } from '../models/oferta.model';

@Injectable({
  providedIn: 'root'
})
export class OfertaService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/offerings`;

  // Consultar serviços.
  // ativos=false retorna todos, inclusive desativados.
  listar(ativos = false): Observable<Oferta[]> {

    const params = new HttpParams()
      .set('ativos', String(ativos));

    return this.http.get<Oferta[]>(
      this.apiUrl,
      { params }
    );
  }

  // Criar serviço.
  criar(oferta: Oferta): Observable<Oferta> {

    return this.http.post<Oferta>(
      this.apiUrl,
      oferta
    );
  }

  // Atualizar serviço.
  atualizar(
    id: number,
    oferta: Oferta
  ): Observable<Oferta> {

    return this.http.put<Oferta>(
      `${this.apiUrl}/${id}`,
      oferta
    );
  }

  // Desativar serviço.
  desativar(id: number): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}