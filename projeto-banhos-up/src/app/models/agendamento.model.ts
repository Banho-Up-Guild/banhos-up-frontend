
export type EspeciePet = 'Cachorro' | 'Gato' | 'Outro';

export interface Pet {
  id: number;
  nome: string;
  especie: string;
  porte: string;
}

export interface Servico {
  id: number;
  nome: string;
  preco: number;
  duracao: number;
  descricao?: string;
  obrigatorio?: boolean;
  grupo: string;
}

export interface PetCadastroRequest {
  nome: string;
  especie: string;
  raca: string | null;
  dataNascimento: string | null;
  porte: 'PEQUENO' | 'MEDIO' | 'GRANDE';
  observacoes: string | null;
  donoId: number;
}

export interface PetResponse extends Omit<PetCadastroRequest, 'porte'> {
  id: number;
  porte: PetCadastroRequest['porte'] | null;
}

export interface ServicoResponse {
  id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  duracaoMinutos: number;
  ativo: boolean;
}

export interface Profissional {
  id: number;
  nome: string;
  fotoUrl?: string;
}

export interface ProfissionalDisponivelResponse {
  employeeId: number;
  employeeName: string;
}

// Enum existente em StatusAppointments.java.
export type StatusAgendamento =
  | 'CONFIRMED'
  | 'CANCELED'
  | 'AWAITING_CONFIRMATION';

export interface PetOfferingRequest {
  petId: number;
  offeringIds: number[];
}

export interface CriarAgendamentoRequest {
  dateTimeAppointment: string;
  status: StatusAgendamento;
  observation: string;
  employeeId: number;
  petOffering: PetOfferingRequest[];
}

export interface AgendamentoResponse {
  dateTimeAppointment: string;
  status: StatusAgendamento;
  observation: string;
  totalPrice: number;
  idEmployee: number;
  nameEmployee: string;
}
