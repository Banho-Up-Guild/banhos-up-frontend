import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PetCadastroRequest, PetResponse } from '../models/agendamento.model';

@Injectable({
  providedIn: 'root'
})
export class PetService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/pets`;

  listarPorDono(donoId: number): Observable<PetResponse[]> {
    const params = new HttpParams().set('donoId', String(donoId));
    return this.http.get<PetResponse[]>(this.apiUrl, { params });
  }

  criar(dados: PetCadastroRequest): Observable<PetResponse> {
    return this.http.post<PetResponse>(this.apiUrl, dados);
  }
}
