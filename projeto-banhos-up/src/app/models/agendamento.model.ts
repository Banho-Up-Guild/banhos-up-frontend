
export type EspeciePet = 'Cachorro' | 'Gato';

export interface Pet {
  id: number;
  nome: string;
  especie: EspeciePet;
  porte: string;
}

export interface Servico {
  id: string | number;
  nome: string;
  preco: number;
  duracao: number;
  descricao?: string;
  obrigatorio?: boolean;
  grupo: string;
}

export interface Profissional {
  id: number;
  nome: string;
  fotoUrl?: string;
}

export interface Disponibilidade {
  data: string;
  horarios: string[];
}

// Resposta real do GET /appointments/calendar.
export interface CalendarioAgendamentoResponse {
  date: string;
  hours: string[];
}

// Enum existente em StatusAppointments.java.
export type StatusAgendamento =
  | 'CONFIRMED'
  | 'CANCELED'
  | 'AWAITING_CONFIRMATION';

// Request real aceito pelo AppointmentsRequestDTO.java.
export interface CriarAgendamentoRequest {
  dateTimeAppointment: string;
  status: StatusAgendamento;
  observation: string;
}

// Resposta da entidade Appointments.
export interface AgendamentoResponse {
  id: number;
  dateTimeAppointment: string;
  status: StatusAgendamento;
  observation: string;
}

// Estrutura planejada para quando o backend
// aceitar o agendamento completo.
export interface PetAgendamentoRequest {
  petId: number;
  servicoIds: (string | number)[];
  profissionalId?: number | null;
  observacoes?: string;
}

export interface AgendamentoCompletoRequest {
  lojaId: number;
  data: string;
  horario: string;
  pets: PetAgendamentoRequest[];
}
