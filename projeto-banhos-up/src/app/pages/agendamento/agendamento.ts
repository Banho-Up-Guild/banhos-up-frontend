import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideTriangleExclamationPoint } from '@lucide/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

import {
  Pet,
  Servico,
  Profissional,
  EspeciePet,
  ProfissionalDisponivelResponse,
  ServicoResponse,
  CriarAgendamentoRequest
} from '../../models/agendamento.model';

import { Loja } from '../../models/loja.model';

import { LojaService } from '../../services/loja.service';
import { AgendamentoApiService } from '../../services/agendamento-api.service';
import {
  PetService,
  PetRequest as PetCadastroRequest,
  PetResponse as PetApiResponse
} from '../../services/pet.service';
import { ServicoService } from '../../services/servico.service';
import { AuthService } from '../../services/auth.service';
import { DisponibilidadeCalendarioResponse } from '../../models/disponibilidade.model';

@Component({
  selector: 'app-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideTriangleExclamationPoint],
  templateUrl: './agendamento.html',
  styleUrl: './agendamento.css',
})
export class Agendamento implements OnInit {

  private readonly router = inject(Router);

  private readonly lojaService = inject(LojaService);

  private readonly agendamentoApi = inject(AgendamentoApiService);

  private readonly petService = inject(PetService);

  private readonly servicoService = inject(ServicoService);

  private readonly authService = inject(AuthService);

  readonly usuarioAtual = this.authService.usuarioAtual;

  // Atualiza a interface após as respostas assíncronas.
  private readonly cdr = inject(ChangeDetectorRef);

  etapa = 0;

  // =========================================
  // PETS
  // =========================================

  pets: Pet[] = [];

  petsSelecionados: number[] = [];

  carregandoPets = false;

  salvandoPet = false;

  erroPets: string | null = null;

  // Limite de pets por agendamento.
  readonly limitePetsPorAgendamento = 3;

  // Aviso visual exibido quando o cliente tenta exceder o limite.
  mostrarAvisoLimitePets = false;

  novoPet = {
    nome: '',
    especie: 'Cachorro' as EspeciePet,
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

  profissionais: Profissional[] = [];

  carregandoProfissionais = false;

  erroProfissionais: string | null = null;

  profissionalSelecionadoId = 0;

  cep = '';
  estado = '';
  cidade = '';

  // =========================================
  // SERVIÇOS
  // =========================================

  servicos: Servico[] = [];

  carregandoServicos = false;

  erroServicos: string | null = null;

  // Cada pet possui sua própria lista de serviços.
  servicosPorPet: Record<number, number[]> = {};

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

  get horariosDoDia(): string[] {

    if (!this.dataSelecionada) {
      return [];
    }

    return this.disponibilidadeCalendario
      .find(item => item.date === this.dataSelecionada)
      ?.hours.map(hora => this.normalizarHora(hora)) || [];
  }

  get horariosIndisponiveisDoDia(): string[] {
    if (!this.dataSelecionada) {
      return [];
    }

    return this.disponibilidadeCalendario
      .find(item => item.date === this.dataSelecionada)
      ?.unavailableHours.map(hora => this.normalizarHora(hora)) || [];
  }

  disponibilidadeCalendario: DisponibilidadeCalendarioResponse[] = [];

  carregandoCalendario = false;

  erroCalendario: string | null = null;

  erroRecomendacao: string | null = null;

  carregandoRecomendacao = false;

  profissionalRecomendado: ProfissionalDisponivelResponse | null = null;

  salvandoAgendamento = false;

  erroConfirmacao: string | null = null;

  agendamentoCriado: {
    profissional: string;
    dataHora: string;
  } | null = null;

  private calendarioRequestId = 0;

  termosAceitos = false;

  confirmado = false;

  // =========================================
  // INICIALIZAÇÃO
  // =========================================

  ngOnInit(): void {

    this.carregarLojas();
    this.carregarServicos();

    const usuario = this.authService.usuarioAtual();

    if (usuario?.role === 'CUSTOMER') {
      this.carregarPets();
    } else {
      this.erroPets = 'Entre na sua conta de cliente para carregar seus pets e agendar.';
    }

  }

  private carregarPets(): void {
    this.carregandoPets = true;
    this.erroPets = null;

    this.petService.listarMeusPets()
      .pipe(finalize(() => {
        this.carregandoPets = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (dados) => {
          this.pets = dados.map(pet => this.mapearPet(pet));

          if (this.pets.length > 0) {
            this.petsSelecionados = [this.pets[0].id];
            this.inicializarServicosDosPets();
          }

          if (this.lojaSelecionada !== null) {
            this.carregarCalendario();
          }

          this.cdr.markForCheck();
        },
        error: (erro: HttpErrorResponse) => {
          this.erroPets = this.mensagemErro(
            erro,
            'Não foi possível carregar os pets da sua conta.'
          );
        }
      });

  }

  carregarServicos(): void {
    this.carregandoServicos = true;
    this.erroServicos = null;

    this.servicoService.listarAtivos()
      .pipe(finalize(() => {
        this.carregandoServicos = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (dados) => {
          this.servicos = dados.map(servico => this.mapearServico(servico));

          this.inicializarServicosDosPets();

          if (this.servicos.length === 0) {
            this.erroServicos = 'Nenhum serviço ativo está disponível.';
          } else if (!this.servicoObrigatorio) {
            this.erroServicos = 'O catálogo não contém o serviço obrigatório Banho.';
          }

          if (this.lojaSelecionada !== null) {
            this.carregarCalendario();
          }

          this.cdr.markForCheck();
        },
        error: (erro: HttpErrorResponse) => {
          this.erroServicos = this.mensagemErro(
            erro,
            'Não foi possível carregar os serviços.'
          );
        }
      });

  }

  recarregarPets(): void {
    const usuario = this.authService.usuarioAtual();
    if (usuario?.role === 'CUSTOMER') {
      this.carregarPets();
    }
  }

  private mapearPet(pet: PetApiResponse): Pet {
    const portes: Record<NonNullable<PetApiResponse['porte']>, string> = {
      PEQUENO: 'Pequeno',
      MEDIO: 'Médio',
      GRANDE: 'Grande'
    };

    return {
      id: pet.id,
      nome: pet.nome,
      especie: pet.especie,
      porte: pet.porte ? portes[pet.porte] : 'Médio'
    };
  }

  private mapearServico(servico: ServicoResponse): Servico {
    return {
      id: servico.id,
      nome: servico.nome,
      preco: servico.preco,
      duracao: servico.duracaoMinutos,
      descricao: servico.descricao || undefined,
      obrigatorio: servico.nome.trim().toLocaleLowerCase('pt-BR') === 'banho',
      grupo: 'Serviços disponíveis'
    };
  }

  private inicializarServicosDosPets(): void {
    const servicoObrigatorio = this.servicoObrigatorio;

    for (const pet of this.pets) {
      if (!this.servicosPorPet[pet.id]) {
        this.servicosPorPet[pet.id] = servicoObrigatorio
          ? [servicoObrigatorio.id]
          : [];
      }
    }
  }

  private mensagemErro(erro: HttpErrorResponse, fallback: string): string {
    const mensagem = erro.error?.message;

    if (typeof mensagem === 'string' && mensagem.trim()) {
      return mensagem;
    }

    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }

    return `${fallback} HTTP ${erro.status}.`;

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

  selecionarLoja(lojaId: number): void {

    if (this.lojaSelecionada === lojaId) {
      return;
    }

    this.lojaSelecionada = lojaId;

    this.profissionais = [];

    this.profissionalSelecionadoId = 0;

    this.dataSelecionada = '';

    this.horarioSelecionado = '';

    this.carregarProfissionais();
    this.carregarCalendario();

  }

  selecionarProfissional(employeeId: number): void {
    this.profissionalSelecionadoId = employeeId;
    this.dataSelecionada = '';
    this.horarioSelecionado = '';
    this.profissionalRecomendado = null;
    this.erroRecomendacao = null;
    this.carregarCalendario();
  }

  carregarProfissionais(): void {

    if (this.lojaSelecionada === null) {
      this.profissionais = [];
      this.erroProfissionais = null;
      return;
    }

    this.carregandoProfissionais = true;

    this.erroProfissionais = null;

    this.cdr.markForCheck();

    this.lojaService.listarFuncionariosPorLoja(this.lojaSelecionada)

      .pipe(
        finalize(() => {
          this.carregandoProfissionais = false;
          this.cdr.markForCheck();
        })
      )

      .subscribe({
        next: (dados) => {

          this.profissionais = dados;

          this.cdr.markForCheck();

        },
        error: (erro: HttpErrorResponse) => {

          console.error(
            'Erro ao carregar profissionais:',
            erro
          );

          this.profissionais = [];

          this.erroProfissionais = erro.status === 0
            ? 'Não foi possível conectar ao servidor.'
            : `Erro ao carregar profissionais. HTTP ${erro.status}.`;

          this.cdr.markForCheck();

        }
      });

  }

  nomeProfissional(profissionalId: number): string {

    if (profissionalId === 0) {
      return this.profissionalRecomendado?.employeeName ||
        'Sem preferência profissional';
    }

    return this.profissionais.find(
      profissional => profissional.id === profissionalId
    )?.nome || 'Profissional selecionado';

  }

  get profissionalAtual(): Profissional | undefined {

    if (this.profissionalSelecionadoId === 0) {
      return undefined;
    }

    return this.profissionais.find(
      profissional =>
        profissional.id === this.profissionalSelecionadoId
    );

  }

  // =========================================
  // INTEGRAÇÃO COM O CALENDÁRIO DO BACKEND
  // =========================================

  carregarCalendario(): void {

    if (this.lojaSelecionada === null) {
      this.disponibilidadeCalendario = [];
      this.erroCalendario = null;
      this.carregandoCalendario = false;
      return;
    }

    const requestId = ++this.calendarioRequestId;
    this.carregandoCalendario = true;
    this.erroCalendario = null;
    this.erroRecomendacao = null;
    this.cdr.markForCheck();

    const yearMonth =
      `${this.mesAtual.getFullYear()}-${String(
        this.mesAtual.getMonth() + 1
      ).padStart(2, '0')}`;

    this.agendamentoApi.listarDisponibilidade(
      yearMonth,
      this.lojaSelecionada,
      this.duracaoTotal,
      this.profissionalSelecionadoId
    )
      .pipe(finalize(() => {
        if (requestId === this.calendarioRequestId) {
          this.carregandoCalendario = false;
          this.cdr.markForCheck();
        }
      }))
      .subscribe({
        next: (dados) => {
          if (requestId !== this.calendarioRequestId) {
            return;
          }
          this.disponibilidadeCalendario = dados;

          // Limpa a data caso ela deixe de possuir horários.
          if (this.dataSelecionada) {
            const possuiHorarios =
              this.disponibilidadeCalendario.some(
                item => item.date === this.dataSelecionada &&
                  (item.hours.length > 0 || item.unavailableHours.length > 0)
              );
            if (!possuiHorarios) {
              this.dataSelecionada = '';
              this.horarioSelecionado = '';
            }
          }

          // Verifica se o horário selecionado ainda é válido.
          if (
            this.horarioSelecionado &&
            !this.horariosDoDia.includes(this.normalizarHora(this.horarioSelecionado))
          ) {
            this.horarioSelecionado = '';
          }
          this.cdr.markForCheck();
        },
        error: (erro: HttpErrorResponse) => {
          if (requestId !== this.calendarioRequestId) {
            return;
          }
          console.error(
            'Erro ao consultar disponibilidade:',
            erro
          );
          this.disponibilidadeCalendario = [];
          this.horarioSelecionado = '';
          this.erroCalendario = this.mensagemErro(
            erro,
            'Não foi possível carregar a disponibilidade.'
          );
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

    const data = this.montarDataISO(dia);

    const disponibilidade =
      this.disponibilidadeCalendario.find(
        item => item.date === data
      );

    return !disponibilidade ||
      (disponibilidade.hours.length === 0 &&
        disponibilidade.unavailableHours.length === 0);

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

    if (
      !this.dataSelecionada ||
      this.carregandoCalendario ||
      !!this.erroCalendario
    ) {
      return true;
    }

    const horarioDisponivel = this.horariosDoDia.some(
      disponivel =>
        this.normalizarHora(disponivel) ===
        this.normalizarHora(hora)
    );

    return !horarioDisponivel ||
      this.horarioPassadoNaData(
        this.dataSelecionada,
        hora
      );

  }

  textoSituacaoHorario(hora: string): string {
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
    this.erroRecomendacao = null;
    this.profissionalRecomendado = null;

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

  private limparSelecaoDeHorario(): void {
    this.dataSelecionada = '';
    this.horarioSelecionado = '';
    this.profissionalRecomendado = null;
    this.erroRecomendacao = null;
    this.erroConfirmacao = null;
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

        return !this.carregandoPets &&
          !this.erroPets &&
          this.petsSelecionados.length > 0;

      case 1:

        return !this.carregandoLojas &&
          this.lojaSelecionada !== null &&
          this.lojas.some(
            loja => loja.id === this.lojaSelecionada
          );

      case 2:

        return !this.carregandoServicos &&
          !this.erroServicos &&
          !!this.servicoObrigatorio &&
          this.petsAtivos.length > 0 &&
          this.petsAtivos.every(pet =>
            this.servicosPet(pet.id).includes(this.servicoObrigatorio!.id)
          );

      case 3:

        return !this.carregandoProfissionais &&
          !this.erroProfissionais;

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

    if (this.etapa === 3) {
      this.limparSelecaoDeHorario();
      this.carregarCalendario();
    }

    if (this.etapa === 4) {
      this.recomendarProfissional();
      return;
    }

    if (this.etapa < 5) {
      this.etapa++;
    }

  }

  private recomendarProfissional(): void {
    if (
      this.lojaSelecionada === null ||
      !this.dataSelecionada ||
      !this.horarioSelecionado
    ) {
      return;
    }

    this.carregandoRecomendacao = true;
    this.erroRecomendacao = null;

    const [year, month, day] = this.dataSelecionada.split('-');
    const dateTime = `${day}-${month}-${year} ${this.normalizarHora(this.horarioSelecionado)}`;

    this.agendamentoApi
      .recomendarProfissional(
        this.lojaSelecionada,
        dateTime,
        this.duracaoTotal,
        this.profissionalSelecionadoId
      )
      .pipe(finalize(() => {
        this.carregandoRecomendacao = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (profissional) => {
          this.profissionalRecomendado = profissional;
          this.erroConfirmacao = null;
          this.etapa = 5;
          this.cdr.markForCheck();
        },
        error: (erro: HttpErrorResponse) => {
          const mensagem = this.mensagemErro(
            erro,
            'Não foi possível verificar a disponibilidade do profissional.'
          );
          const mensagemNormalizada = mensagem.toLocaleLowerCase('pt-BR');
          const semProfissionais =
            mensagemNormalizada.includes('profissionais ativos');
          const indisponivel =
            mensagemNormalizada.includes('profissional disponível nesse horário') ||
            mensagemNormalizada.includes('indisponível nesse horário') ||
            mensagemNormalizada.includes('não possui horário de funcionamento');

          if (indisponivel) {
            this.limparSelecaoDeHorario();
            this.carregarCalendario();
            this.erroRecomendacao =
              'Esse horário não está mais disponível. Escolha outro dia e horário.';
          } else if (semProfissionais) {
            this.erroRecomendacao =
              'Não há profissionais ativos nesta unidade para atender.';
          } else if (erro.status === 400) {
            this.erroRecomendacao = `Verifique os dados do agendamento: ${mensagem}`;
          } else {
            this.erroRecomendacao = mensagem;
          }

          this.cdr.markForCheck();
        }
      });
  }

  voltar(): void {

    if (this.etapa > 0) {
      this.etapa--;
      return;
    }

    // Na primeira etapa, a seta leva o cliente de volta à Home.
    this.router.navigateByUrl('/');

  }

  // =========================================
  // SELEÇÃO DE PETS
  // =========================================

  alternarPet(id: number): void {
    if (this.petsSelecionados.includes(id)) {
      this.petsSelecionados = this.petsSelecionados.filter(
        petId => petId !== id
      );
      this.mostrarAvisoLimitePets = false;
      this.limparSelecaoDeHorario();
      this.carregarCalendario();
      return;
    }

    if (this.petsSelecionados.length >= this.limitePetsPorAgendamento) {
      this.mostrarAvisoLimitePets = true;
      return;
    }

    this.petsSelecionados = [...this.petsSelecionados, id];
    this.mostrarAvisoLimitePets = false;
    this.garantirBanho(id);
    this.limparSelecaoDeHorario();
    this.carregarCalendario();
  }

  adicionarPet(): void {

    if (this.petsSelecionados.length >= this.limitePetsPorAgendamento) {
      this.mostrarAvisoLimitePets = true;
      return;
    }

    if (!this.novoPet.nome.trim()) {
      return;
    }

    const usuario = this.authService.usuarioAtual();

    if (usuario?.role !== 'CUSTOMER') {
      this.erroPets = 'Entre na sua conta de cliente para cadastrar um pet.';
      return;
    }

    const porte: Record<string, PetCadastroRequest['porte']> = {
      Pequeno: 'PEQUENO',
      'Médio': 'MEDIO',
      Grande: 'GRANDE'
    };

    const dados: PetCadastroRequest = {
      nome: this.novoPet.nome.trim(),
      especie: this.novoPet.especie,
      raca: null,
      dataNascimento: null,
      porte: porte[this.novoPet.porte],
      observacoes: null
    };

    this.salvandoPet = true;
    this.erroPets = null;

    this.petService.cadastrar(dados)
      .pipe(finalize(() => {
        this.salvandoPet = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (resposta) => {
          const pet = this.mapearPet(resposta);
          this.pets = [...this.pets, pet];
          this.erroPets = null;
          this.servicosPorPet[pet.id] = this.servicoObrigatorio
            ? [this.servicoObrigatorio.id]
            : [];
          this.petsSelecionados = [...this.petsSelecionados, pet.id];
          this.novoPet = {
            nome: '',
            especie: 'Cachorro',
            porte: 'Médio'
          };
          this.mostrarNovoPet = false;
          this.limparSelecaoDeHorario();
          this.carregarCalendario();
        },
        error: (erro: HttpErrorResponse) => {
          this.erroPets = this.mensagemErro(
            erro,
            'Não foi possível cadastrar o pet.'
          );
        }
      });

  }

  // =========================================
  // SERVIÇOS
  // =========================================

  get servicoObrigatorio(): Servico | undefined {
    return this.servicos.find(servico => servico.obrigatorio);
  }

  private garantirBanho(petId: number): void {
    const atuais = this.servicosPorPet[petId] || [];
    const banho = this.servicoObrigatorio;

    if (banho && !atuais.includes(banho.id)) {
      this.servicosPorPet[petId] = [banho.id, ...atuais];
    }
  }

  servicosPet(id: number): number[] {
    this.garantirBanho(id);
    return this.servicosPorPet[id] || [];
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
    if (servico.obrigatorio) {
      this.garantirBanho(petId);
      return;
    }

    this.servicosPorPet[petId] =
      atuais.includes(servico.id)
        ? atuais.filter(id => id !== servico.id)
        : [...atuais, servico.id];

    this.limparSelecaoDeHorario();
    this.carregarCalendario();

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

  precoServico(id: number): number {

    return this.servicos.find(
      servico => servico.id === id
    )?.preco || 0;

  }

  nomeServico(id: number): string {

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
    this.profissionalRecomendado = null;
    this.erroRecomendacao = null;

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
    this.erroRecomendacao = null;
    this.profissionalRecomendado = null;

  }

  diaSelecionado(dia: number): boolean {

    return this.dataSelecionada === this.montarDataISO(dia);

  }

  // =========================================
  // CONFIRMAÇÃO
  // =========================================

  confirmar(): void {

    if (
      !this.termosAceitos ||
      this.salvandoAgendamento ||
      !this.profissionalRecomendado ||
      !this.dataSelecionada ||
      !this.horarioSelecionado
    ) {
      return;
    }

    const observacao = this.petsAtivos
      .map(pet => {
        const texto = this.observacoes[pet.id]?.trim();
        return texto ? `${pet.nome}: ${texto}` : '';
      })
      .filter(Boolean)
      .join('\n');

    const dados: CriarAgendamentoRequest = {
      dateTimeAppointment: `${this.dataSelecionada}T${this.horarioSelecionado}:00`,
      status: 'AWAITING_CONFIRMATION',
      observation: observacao,
      employeeId: this.profissionalRecomendado.employeeId,
      petOffering: this.petsAtivos.map(pet => ({
        petId: pet.id,
        offeringIds: this.servicosPet(pet.id)
      }))
    };

    this.salvandoAgendamento = true;
    this.erroConfirmacao = null;

    this.agendamentoApi.criarAgendamento(dados)
      .pipe(finalize(() => {
        this.salvandoAgendamento = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (resposta) => {
          this.agendamentoCriado = {
            profissional: resposta.nameEmployee,
            dataHora: resposta.dateTimeAppointment
          };
          this.confirmado = true;
          this.cdr.markForCheck();
        },
        error: (erro: HttpErrorResponse) => {
          this.erroConfirmacao = this.mensagemErro(
            erro,
            'Não foi possível cadastrar o agendamento.'
          );
          this.cdr.markForCheck();
        }
      });

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