
export interface Loja {
  id: number;
  nome: string;
  cep: string;
  estado: string;
  cidade: string;
  endereco: string;
  bairro: string;
  ativa: boolean;
}

export interface LojaRequest {
  nome: string;
  cep: string;
  estado: string;
  cidade: string;
  endereco: string;
  bairro: string;
}
