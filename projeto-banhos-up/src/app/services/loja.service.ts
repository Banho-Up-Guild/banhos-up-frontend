
import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Loja } from '../models/loja.model';

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
  listarFuncionariosPorLoja(idStore: number): Observable<(string | {
    id?: number;
    employeeId?: number;
    nome?: string;
    name?: string;
    fotoUrl?: string;
    avatarUrl?: string;
    profileImageUrl?: string;
    imageUrl?: string;
  })[]> {

    const params = new HttpParams()
      .set('idStore', String(idStore));

    return this.http.get<(string | {
      id?: number;
      employeeId?: number;
      nome?: string;
      name?: string;
      fotoUrl?: string;
      avatarUrl?: string;
      profileImageUrl?: string;
      imageUrl?: string;
    })[]>(
      `${environment.apiUrl}/users/store_employee`,
      { params }
    );
  }

}
