import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type StatusAgendamentoCliente =
  | 'CONFIRMED'
  | 'CANCELED'
  | 'AWAITING_CONFIRMATION';

export interface ItemAgendamentoCliente {
  petId: number;
  petName: string;
  species: string;
  offeringId: number;
  offeringName: string;
  offeringPrice: number;
}

export interface AgendamentoClienteResponse {
  id: number;
  dateTimeAppointment: string;
  status: StatusAgendamentoCliente;
  observation: string | null;
  totalPrice: number;
  employeeId: number | null;
  employeeName: string | null;
  customerName: string;
  customerEmail: string;
  items: ItemAgendamentoCliente[];
}

@Injectable({ providedIn: 'root' })
export class MeusAgendamentosService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/customer/me/appointments`;

  listar(): Observable<AgendamentoClienteResponse[]> {
    return this.http.get<AgendamentoClienteResponse[]>(this.endpoint);
  }
}