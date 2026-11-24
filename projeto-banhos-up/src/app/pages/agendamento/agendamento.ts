
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import {
  Pet,
  Servico,
  CalendarioAgendamentoResponse
} from '../../models/agendamento.model';

import { Loja } from '../../models/loja.model';

import { LojaService } from '../../services/loja.service';
import { AgendamentoApiService } from '../../services/agendamento-api.service';

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendamento.html',
  styleUrl: './agendamento.css',
})
export class Agendamento implements OnInit {

  private readonly lojaService = inject(LojaService);

  private readonly agendamentoApi = inject(AgendamentoApiService);

  // Atualiza a interface após as respostas assíncronas.
  private readonly cdr = inject(ChangeDetectorRef);

  etapa = 0;

  // =========================================
  // PETS
  // Dados locais provisórios.
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
  // Integração com a API do Spring Boot.
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

  // Cada pet possui sua própria lista de serviços.
  servicosPorPet: Record<number, (string | number)[]> = {
    1: ['banho'],
    2: ['banho']
  };

  // =========================================
  // PROFISSIONAIS
  // Dados locais provisórios.
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
  // CALENDÁRIO - INTEGRAÇÃO COM A API
  // =========================================

  mesAtual = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );

  dataSelecionada = '';

  horarioSelecionado = '';

  // Horários provisórios.
  // O backend atual informa somente os horários ocupados.
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

  calendarioAgendamentos: CalendarioAgendamentoResponse[] = [];

  carregandoCalendario = false;

  erroCalendario: string | null = null;

  termosAceitos = false;

  confirmado = false;

  // =========================================
  // INICIALIZAÇÃO
  // =========================================

  ngOnInit(): void {

    this.carregarLojas();

    this.carregarCalendario();

  }

  // =========================================
  // INTEGRAÇÃO COM A API DE LOJAS
  // =========================================

  carregarLojas(): void {

    this.carregandoLojas = true;

    this.erroLojas = null;

    this.cdr.markForCheck();

    this.lojaService.listarLojas(true)

      .pipe(

        finalize(() => {

          this.carregandoLojas = false;

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: (dados: Loja[]) => {

          this.lojas = dados.filter(
            loja => loja.ativa
          );

          if (
            this.lojaSelecionada !== null &&
            !this.lojas.some(
              loja => loja.id === this.lojaSelecionada
            )
          ) {

            this.lojaSelecionada = null;

          }

          this.cdr.markForCheck();

        },

        error: (erro: HttpErrorResponse) => {

          console.error(
            'Erro ao carregar lojas:',
            erro
          );

          this.lojas = [];

          this.lojaSelecionada = null;

          this.erroLojas = erro.status === 0
            ? 'Não foi possível conectar ao servidor.'
            : `Erro ao carregar lojas. HTTP ${erro.status}.`;

          this.cdr.markForCheck();

        }

      });

  }

  formatarCep(cep: string): string {

    const numeros = cep.replace(/\D/g, '');

    if (numeros.length !== 8) {
      return cep;
    }

    return `${numeros.substring(0, 5)}-${numeros.substring(5)}`;

  }

  // =========================================
  // INTEGRAÇÃO COM O CALENDÁRIO DO BACKEND
  // =========================================

  carregarCalendario(): void {

    this.carregandoCalendario = true;

    this.erroCalendario = null;

    this.cdr.markForCheck();

    const yearMonth =
      `${this.mesAtual.getFullYear()}-${String(
        this.mesAtual.getMonth() + 1
      ).padStart(2, '0')}`;

    console.log(
      'Consultando calendário:',
      yearMonth
    );

    this.agendamentoApi.listarCalendario(yearMonth)

      .pipe(

        finalize(() => {

          this.carregandoCalendario = false;

          console.log(
            'Consulta do calendário finalizada:',
            yearMonth
          );

          this.cdr.markForCheck();

        })

      )

      .subscribe({

        next: (dados) => {

          console.log(
            'Calendário recebido do backend:',
            dados
          );

          this.calendarioAgendamentos = dados || [];

          // Verifica se a data selecionada continua disponível.
          if (this.dataSelecionada) {

            const diaSelecionado = Number(
              this.dataSelecionada.substring(8, 10)
            );

            if (this.diaSemHorariosDisponiveis(diaSelecionado)) {

              this.dataSelecionada = '';

              this.horarioSelecionado = '';

            }

          }

          // Verifica se o horário selecionado continua disponível.
          if (
            this.horarioSelecionado &&
            this.horarioIndisponivel(this.horarioSelecionado)
          ) {

            this.horarioSelecionado = '';

          }

          this.cdr.markForCheck();

        },

        error: (erro: HttpErrorResponse) => {

          console.error(
            'Erro ao consultar calendário:',
            erro
          );

          this.calendarioAgendamentos = [];

          this.horarioSelecionado = '';

          this.erroCalendario = erro.status === 0
            ? 'Não foi possível conectar ao servidor para consultar os horários.'
            : `Erro ao carregar disponibilidade. HTTP ${erro.status}.`;

          this.cdr.markForCheck();

        }

      });

  }

  // =========================================
  // VERIFICAÇÃO DE HORÁRIOS
  // =========================================

  private normalizarHora(hora: string): string {

    // O backend pode devolver 09:00:00.
    // O frontend utiliza 09:00.
    return hora.substring(0, 5);

  }

  // Monta uma data no formato YYYY-MM-DD.
  private montarDataISO(dia: number): string {

    const ano = this.mesAtual.getFullYear();

    const mes = String(
      this.mesAtual.getMonth() + 1
    ).padStart(2, '0');

    const diaFormatado = String(dia).padStart(2, '0');

    return `${ano}-${mes}-${diaFormatado}`;

  }

  // Verifica se determinado horário está ocupado em uma data.
  private horarioOcupadoNaData(
    data: string,
    hora: string
  ): boolean {

    const agendamentosDoDia =
      this.calendarioAgendamentos.filter(
        item => item.date === data
      );

    const horariosOcupados = agendamentosDoDia.flatMap(
      item => item.hours || []
    );

    return horariosOcupados.some(
      horaBackend =>
        this.normalizarHora(horaBackend) ===
        this.normalizarHora(hora)
    );

  }

  // Verifica se um horário já passou considerando a data informada.
  private horarioPassadoNaData(
    data: string,
    hora: string
  ): boolean {

    const [ano, mes, dia] = data
      .split('-')
      .map(Number);

    const [horas, minutos] = hora
      .split(':')
      .map(Number);

    const horarioEscolhido = new Date(
      ano,
      mes - 1,
      dia,
      horas,
      minutos,
      0,
      0
    );

    return horarioEscolhido.getTime() <= Date.now();

  }

  // Verifica se TODOS os horários daquele dia estão indisponíveis.
  diaSemHorariosDisponiveis(dia: number): boolean {

    if (
      this.carregandoCalendario ||
      this.erroCalendario
    ) {
      return false;
    }

    if (this.horarios.length === 0) {
      return true;
    }

    const data = this.montarDataISO(dia);

    return this.horarios.every(hora => {

      const ocupado = this.horarioOcupadoNaData(
        data,
        hora
      );

      const passou = this.horarioPassadoNaData(
        data,
        hora
      );

      return ocupado || passou;

    });

  }

  // Verifica se a data já passou.
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

  // Verifica se o horário está ocupado na data selecionada.
  horarioOcupado(hora: string): boolean {

    if (!this.dataSelecionada) {
      return false;
    }

    return this.horarioOcupadoNaData(
      this.dataSelecionada,
      hora
    );

  }

  // Verifica se o horário selecionado já passou.
  horarioPassado(hora: string): boolean {

    if (!this.dataSelecionada) {
      return false;
    }

    return this.horarioPassadoNaData(
      this.dataSelecionada,
      hora
    );

  }

  // Verifica se um horário pode ser selecionado.
  horarioIndisponivel(hora: string): boolean {

    return !this.dataSelecionada ||
      this.carregandoCalendario ||
      !!this.erroCalendario ||
      this.horarioOcupado(hora) ||
      this.horarioPassado(hora);

  }

  textoSituacaoHorario(hora: string): string {

    if (this.horarioOcupado(hora)) {
      return 'Horário ocupado';
    }

    if (this.horarioPassado(hora)) {
      return 'Horário indisponível';
    }

    return `${this.duracaoTotal} min`;

  }

  selecionarHorario(hora: string): void {

    if (this.horarioIndisponivel(hora)) {
      return;
    }

    this.horarioSelecionado = hora;

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

        // O profissional continua sendo opcional.
        return true;

      case 4:

        return !this.carregandoCalendario &&
          !this.erroCalendario &&
          !!this.dataSelecionada &&
          !!this.horarioSelecionado &&
          !this.horarioIndisponivel(this.horarioSelecionado);

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

    // O Banho é obrigatório e nunca pode ser removido.
    if (
      servico.id === 'banho' ||
      servico.obrigatorio
    ) {

      this.garantirBanho(petId);

      return;

    }

    // Serviços opcionais podem ser adicionados ou removidos.
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

    // Limpa a data e o horário anteriores.
    this.dataSelecionada = '';

    this.horarioSelecionado = '';

    // Consulta a disponibilidade do novo mês.
    this.carregarCalendario();

  }

  selecionarDia(dia: number): void {

    // Não permite selecionar dias indisponíveis.
    if (
      this.diaPassado(dia) ||
      this.carregandoCalendario ||
      !!this.erroCalendario ||
      this.diaSemHorariosDisponiveis(dia)
    ) {
      return;
    }

    this.dataSelecionada = this.montarDataISO(dia);

    this.horarioSelecionado = '';

  }

  diaSelecionado(dia: number): boolean {

    return this.dataSelecionada === this.montarDataISO(dia);

  }

  // =========================================
  // CONFIRMAÇÃO
  // Ainda é demonstrativa.
  // O POST não é chamado até o backend
  // aceitar os dados completos do agendamento.
  // =========================================

  confirmar(): void {

    if (this.termosAceitos) {
      this.confirmado = true;
    }

  }

  // =========================================
  // FORMATAÇÃO DE VALORES
  // =========================================

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
