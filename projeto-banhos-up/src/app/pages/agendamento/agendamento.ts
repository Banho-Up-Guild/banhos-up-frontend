
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { Pet, Servico } from '../../models/agendamento.model';
import { Loja } from '../../models/loja.model';
import { LojaService } from '../../services/loja.service';

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendamento.html',
  styleUrl: './agendamento.css',
})
export class Agendamento implements OnInit {

  private readonly lojaService = inject(LojaService);

  etapa = 0;

  // =========================================
  // PETS
  // Dados locais provisórios.
  // Futuramente serão recebidos da API.
  // =========================================

  pets: Pet[] = [
    {
      id: 1,
      nome: 'Pet 1',
      especie: 'Cachorro',
      porte: 'Médio'
    },
    {
      id: 2,
      nome: 'Pet 2',
      especie: 'Gato',
      porte: 'Pequeno'
    }
  ];

  petsSelecionados: number[] = [1];

  novoPet = {
    nome: '',
    especie: 'Cachorro' as 'Cachorro' | 'Gato',
    porte: 'Médio'
  };

  mostrarNovoPet = false;

  // =========================================
  // LOJAS
  // Dados recebidos do Spring Boot.
  // =========================================

  lojas: Loja[] = [];

  lojaSelecionada: number | null = null;

  carregandoLojas = false;

  erroLojas: string | null = null;

  cep = '';
  estado = '';
  cidade = '';

  // =========================================
  // SERVIÇOS
  // Dados locais provisórios.
  // Futuramente serão recebidos da API.
  // =========================================

  servicos: Servico[] = [
    {
      id: 'banho',
      nome: 'Banho',
      preco: 170,
      duracao: 90,
      obrigatorio: true,
      grupo: 'Principal'
    },
    {
      id: 'tosa-tesoura',
      nome: 'Tosa com tesoura',
      preco: 60,
      duracao: 90,
      descricao: 'Indicado para cortes personalizados',
      grupo: 'Tosas'
    },
    {
      id: 'tosa-higienica',
      nome: 'Tosa higiênica',
      preco: 30,
      duracao: 120,
      grupo: 'Tosas'
    },
    {
      id: 'escovacao',
      nome: 'Escovação dental',
      preco: 11,
      duracao: 15,
      descricao: 'Indicado para prevenção de tártaro e mau hálito',
      grupo: 'Cuidados adicionais'
    },
    {
      id: 'argan',
      nome: 'Manutenção argan',
      preco: 30,
      duracao: 20,
      descricao: 'Para pelo sem brilho, ressecado ou áspero',
      grupo: 'Tratamento de pelagem e pele'
    },
    {
      id: 'nutricao',
      nome: 'Nutrição ouro',
      preco: 35,
      duracao: 25,
      descricao: 'Para pelo frágil, com queda ou elástico',
      grupo: 'Tratamento de pelagem e pele'
    },
    {
      id: 'liso',
      nome: 'Liso perfeito',
      preco: 30,
      duracao: 25,
      descricao: 'Para pelo poroso, desalinhado ou com frizz',
      grupo: 'Tratamento de pelagem e pele'
    }
  ];

  // Cada pet possui seus próprios serviços.
  servicosPorPet: Record<number, (string | number)[]> = {
    1: ['banho'],
    2: ['banho']
  };

  // =========================================
  // PROFISSIONAIS
  // Dados locais provisórios.
  // Futuramente serão recebidos da API.
  // =========================================

  profissionais: string[] = [
    'Sem preferência de profissional',
    'Gabriel Ramon Evangelista Ramos',
    'Eryka Karolyna Marçal dos Santos',
    'Camila Santos de Barros'
  ];

  profissionalPorPet: Record<number, string> = {};

  observacoes: Record<number, string> = {};

  // =========================================
  // DATA E HORÁRIO
  // Dados locais provisórios.
  // Futuramente serão recebidos da API.
  // =========================================

  mesAtual = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  dataSelecionada = '';

  horarioSelecionado = '';

  horarios: string[] = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30'
  ];

  termosAceitos = false;

  confirmado = false;

  // =========================================
  // INICIALIZAÇÃO
  // =========================================

  ngOnInit(): void {

    // Busca as lojas reais do backend.
    this.carregarLojas();

  }

  // =========================================
  // INTEGRAÇÃO COM O BACKEND
  // =========================================

  carregarLojas(): void {

    this.carregandoLojas = true;
    this.erroLojas = null;

    this.lojaService.listarLojas(true)

      .pipe(
        finalize(() => {
          this.carregandoLojas = false;
        })
      )

      .subscribe({

        next: (dados: Loja[]) => {

          // O backend já filtra as lojas ativas.
          // Mantemos uma segunda verificação no frontend.
          this.lojas = dados.filter(loja => loja.ativa);

          // Limpa uma seleção anterior se a loja
          // não estiver mais disponível.
          if (
            this.lojaSelecionada !== null &&
            !this.lojas.some(
              loja => loja.id === this.lojaSelecionada
            )
          ) {
            this.lojaSelecionada = null;
          }

        },

        error: (erro: HttpErrorResponse) => {

          console.error(
            'Erro ao carregar as lojas:',
            erro
          );

          this.lojas = [];
          this.lojaSelecionada = null;

          if (erro.status === 0) {

            this.erroLojas =
              'Não foi possível conectar ao servidor. Verifique se o Spring Boot está funcionando.';

          } else {

            this.erroLojas =
              `Erro ao carregar as lojas. Código HTTP: ${erro.status}.`;

          }

        }

      });

  }

  // Formata o CEP que vem do backend.
  // O banco armazena somente números.

  formatarCep(cep: string): string {

    const numeros = cep.replace(/\D/g, '');

    if (numeros.length !== 8) {
      return cep;
    }

    return `${numeros.substring(0, 5)}-${numeros.substring(5)}`;

  }

  // =========================================
  // GETTERS
  // =========================================

  get petsAtivos(): Pet[] {

    return this.pets.filter(pet =>
      this.petsSelecionados.includes(pet.id)
    );

  }

  get lojaAtual(): Loja | undefined {

    return this.lojas.find(loja =>
      loja.id === this.lojaSelecionada
    );

  }

  get total(): number {

    return this.petsAtivos.reduce(
      (soma, pet) => soma + this.precoPet(pet.id),
      0
    );

  }

  get duracaoTotal(): number {

    return Math.max(
      30,
      ...this.petsAtivos.map(pet =>
        this.duracaoPet(pet.id)
      )
    );

  }

  get diasMes(): (number | null)[] {

    const primeiro = new Date(
      this.mesAtual.getFullYear(),
      this.mesAtual.getMonth(),
      1
    ).getDay();

    const total = new Date(
      this.mesAtual.getFullYear(),
      this.mesAtual.getMonth() + 1,
      0
    ).getDate();

    return [
      ...Array(primeiro).fill(null),
      ...Array.from(
        { length: total },
        (_, i) => i + 1
      )
    ];

  }

  get tituloMes(): string {

    return this.mesAtual.toLocaleDateString(
      'pt-BR',
      {
        month: 'long',
        year: 'numeric'
      }
    );

  }

  get dataFormatada(): string {

    if (!this.dataSelecionada) {
      return 'Selecione uma data';
    }

    return new Date(
      `${this.dataSelecionada}T12:00:00`
    ).toLocaleDateString(
      'pt-BR',
      {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );

  }

  // =========================================
  // VALIDAÇÃO DAS ETAPAS
  // =========================================

  podeAvancar(): boolean {

    switch (this.etapa) {

      case 0:

        return this.petsSelecionados.length > 0;

      case 1:

        return !this.carregandoLojas &&
          this.lojaSelecionada !== null &&
          this.lojas.some(
            loja => loja.id === this.lojaSelecionada
          );

      case 2:

        return this.petsAtivos.length > 0 &&
          this.petsAtivos.every(pet =>
            this.servicosPet(pet.id).includes('banho')
          );

      case 3:

        // O profissional é opcional.
        return true;

      case 4:

        return !!this.dataSelecionada &&
          !!this.horarioSelecionado;

      default:

        return false;

    }

  }

  // =========================================
  // NAVEGAÇÃO
  // =========================================

  avancar(): void {

    if (!this.podeAvancar()) {
      return;
    }

    if (this.etapa === 1) {

      this.petsAtivos.forEach(pet => {
        this.garantirBanho(pet.id);
      });

    }

    if (this.etapa < 5) {
      this.etapa++;
    }

  }

  voltar(): void {

    if (this.etapa > 0) {
      this.etapa--;
    }

  }

  // =========================================
  // SELEÇÃO DE PETS
  // =========================================

  alternarPet(id: number): void {

    this.garantirBanho(id);

    this.petsSelecionados =
      this.petsSelecionados.includes(id)
        ? this.petsSelecionados.filter(x => x !== id)
        : [...this.petsSelecionados, id];

  }

  adicionarPet(): void {

    if (!this.novoPet.nome.trim()) {
      return;
    }

    const id = Math.max(
      0,
      ...this.pets.map(pet => pet.id)
    ) + 1;

    this.pets.push({
      id,
      ...this.novoPet
    });

    this.servicosPorPet[id] = ['banho'];

    this.petsSelecionados = [
      ...this.petsSelecionados,
      id
    ];

    this.novoPet = {
      nome: '',
      especie: 'Cachorro',
      porte: 'Médio'
    };

    this.mostrarNovoPet = false;

  }

  // =========================================
  // SERVIÇOS
  // =========================================

  private garantirBanho(petId: number): void {

    const atuais = this.servicosPorPet[petId] || [];

    if (!atuais.includes('banho')) {

      this.servicosPorPet[petId] = [
        'banho',
        ...atuais
      ];

    }

  }

  servicosPet(id: number): (string | number)[] {

    this.garantirBanho(id);

    return this.servicosPorPet[id];

  }

  alternarServico(
    petId: number,
    servico: Servico
  ): void {

    this.garantirBanho(petId);

    const atuais = [
      ...this.servicosPorPet[petId]
    ];

    // Banho é obrigatório e nunca pode ser removido.
    if (
      servico.id === 'banho' ||
      servico.obrigatorio
    ) {

      this.garantirBanho(petId);

      return;

    }

    // Serviços opcionais.
    this.servicosPorPet[petId] =
      atuais.includes(servico.id)
        ? atuais.filter(id => id !== servico.id)
        : [...atuais, servico.id];

  }

  precoPet(id: number): number {

    return this.servicos

      .filter(servico =>
        this.servicosPet(id).includes(servico.id)
      )

      .reduce(
        (valor, servico) => valor + servico.preco,
        0
      );

  }

  duracaoPet(id: number): number {

    return this.servicos

      .filter(servico =>
        this.servicosPet(id).includes(servico.id)
      )

      .reduce(
        (valor, servico) => valor + servico.duracao,
        0
      );

  }

  precoServico(id: string | number): number {

    return this.servicos.find(
      servico => servico.id === id
    )?.preco || 0;

  }

  nomeServico(id: string | number): string {

    return this.servicos.find(
      servico => servico.id === id
    )?.nome || '';

  }

  grupoServicos(): string[] {

    return [
      ...new Set(
        this.servicos.map(servico => servico.grupo)
      )
    ];

  }

  servicosDoGrupo(grupo: string): Servico[] {

    return this.servicos.filter(
      servico => servico.grupo === grupo
    );

  }

  // =========================================
  // CALENDÁRIO
  // =========================================

  mudarMes(delta: number): void {

    this.mesAtual = new Date(
      this.mesAtual.getFullYear(),
      this.mesAtual.getMonth() + delta,
      1
    );

  }

  selecionarDia(dia: number): void {

    const data = new Date(
      this.mesAtual.getFullYear(),
      this.mesAtual.getMonth(),
      dia
    );

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    if (data < hoje) {
      return;
    }

    this.dataSelecionada =
      `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;

    this.horarioSelecionado = '';

  }

  diaSelecionado(dia: number): boolean {

    return this.dataSelecionada ===
      `${this.mesAtual.getFullYear()}-${String(this.mesAtual.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

  }

  diaPassado(dia: number): boolean {

    const data = new Date(
      this.mesAtual.getFullYear(),
      this.mesAtual.getMonth(),
      dia
    );

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    return data < hoje;

  }

  // =========================================
  // CONFIRMAÇÃO
  // =========================================

  confirmar(): void {

    if (this.termosAceitos) {
      this.confirmado = true;
    }

  }

  formatar(valor: number): string {

    return valor.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    );

  }

}
