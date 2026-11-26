export interface Oferta {
  id: number | null;
  nome: string;
  descricao: string | null;
  preco: number;
  duracaoMinutos: number;
  ativo: boolean;
}