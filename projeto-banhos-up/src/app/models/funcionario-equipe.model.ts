export interface FuncionarioEquipe {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  matricula: string | null;
  cargo: string | null;
  storeId: number | null;
  nomeUnidade: string | null;
  ativo: boolean;
  teamActive: boolean;
}

export interface AlterarCargoRequest {
  position: string;
}

export interface CriarFuncionarioRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  registry: string;
  position: string;
}