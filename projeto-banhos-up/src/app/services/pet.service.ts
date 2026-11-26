import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export type PortePet = 'PEQUENO' | 'MEDIO' | 'GRANDE';

export interface PetRequest {
  nome: string;
  especie: string;
  raca: string | null;
  dataNascimento: string | null;
  porte: PortePet | null;
  observacoes: string | null;
}

export interface PetResponse extends PetRequest {
  id: number;
  donoId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PetService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/pets`;

  listarMeusPets(): Observable<PetResponse[]> {
    return this.http.get<PetResponse[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<PetResponse> {
    return this.http.get<PetResponse>(`${this.apiUrl}/${id}`);
  }

  cadastrar(dados: PetRequest): Observable<PetResponse> {
    return this.http.post<PetResponse>(this.apiUrl, dados);
  }

  atualizar(
    id: number,
    dados: PetRequest
  ): Observable<PetResponse> {
    return this.http.put<PetResponse>(
      `${this.apiUrl}/${id}`,
      dados
    );
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
