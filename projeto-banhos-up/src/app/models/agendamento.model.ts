
export type EspeciePet = 'Cachorro' | 'Gato';

// Dados do pet recebidos da API.
export interface Pet {
  id: number;
  nome: string;
  especie: EspeciePet;
  porte: string;
}

// Dados dos serviços recebidos da API.
export interface Servico {
  id: string | number;
  nome: string;
  preco: number;
  duracao: number;
  descricao?: string;
  obrigatorio?: boolean;
  grupo: string;
}

// Dados dos profissionais recebidos da API.
export interface Profissional {
  id: number;
  nome: string;
}

// Disponibilidade retornada pela API.
export interface Disponibilidade {
  data: string;
  horarios: string[];
}

// Dados de cada pet dentro de um agendamento.
export interface PetAgendamentoRequest {
  petId: number;
  servicoIds: (string | number)[];
  profissionalId?: number | null;
  observacoes?: string;
}

// Estrutura inicial proposta para enviar um agendamento.
export interface AgendamentoRequest {
  lojaId: number;
  data: string;
  horario: string;
  pets: PetAgendamentoRequest[];
}
