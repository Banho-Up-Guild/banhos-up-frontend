import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../services/auth.service';

import { HttpErrorResponse } from '@angular/common/http';
import { LojaService } from '../../services/loja.service';
import { Loja } from '../../models/loja.model';

import { FuncionarioAgendamentoService } from '../../services/funcionario-agendamento.service';

import {
  AppointmentManagement,
  AppointmentFilters
} from '../../models/funcionario-agendamento.model';

import { StatusAgendamento } from '../../models/agendamento.model';

import { FormsModule } from '@angular/forms';

import { DisponibilidadeService } from '../../services/disponibilidade.service';

import { DiaDisponibilidade } from '../../models/disponibilidade.model';

type ModuloFuncionario =
  | 'painel'
  | 'agendamentos'
  | 'disponibilidade'
  | 'solicitacoes'
  | 'servicos'
  | 'equipe'
  | 'unidade';

@Component({
  selector: 'app-funcionario',
  imports: [RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './funcionario.html',
  styleUrl: './funcionario.css',
})
export class Funcionario {

  private readonly disponibilidadeService =
    inject(DisponibilidadeService);
  private readonly lojaService = inject(LojaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly funcionarioAgendamentoService =
    inject(FuncionarioAgendamentoService);


  // DIAS E HORÁRIOS DA SEMANA
  readonly diasDisponibilidade = signal<DiaDisponibilidade[]>([]);

  readonly carregandoDisponibilidade = signal(false);

  readonly salvandoDisponibilidade = signal(false);

  readonly erroDisponibilidade = signal('');

  readonly sucessoDisponibilidade = signal('');

  readonly disponibilidadeStoreId = signal<number | null>(null);

  readonly nomeUnidadeDisponibilidade = signal('');

  // Dados dos agendamentos
  readonly agendamentos = signal<AppointmentManagement[]>([]);

  readonly carregandoAgendamentos = signal(false);

  readonly erroAgendamentos = signal('');

  // Filtros
  readonly filtroDataInicio = signal('');
  readonly filtroDataFim = signal('');

  readonly filtroStatus = signal<StatusAgendamento | ''>('');

  // Controle das ações
  readonly processandoAgendamento = signal<number | null>(null);

  // Permissões do funcionário
  readonly permissoesFuncionario = signal<string[]>([]);

  readonly usuarioAtual = this.authService.usuarioAtual;

  // Unidades retornadas pelo Backend
  readonly unidades = signal<Loja[]>([]);

  // Estado de carregamento
  readonly carregandoUnidades = signal(false);

  // Mensagem de erro
  readonly erroUnidades = signal('');

  readonly modulo = signal<ModuloFuncionario>('painel');

  readonly menu = [
    {
      path: 'painel' as ModuloFuncionario,
      titulo: 'Painel inicial',
      icone: '⌂'
    },
    {
      path: 'agendamentos' as ModuloFuncionario,
      titulo: 'Agendamentos',
      icone: '▦'
    },
    {
      path: 'disponibilidade' as ModuloFuncionario,
      titulo: 'Disponibilidade e horários',
      icone: '◷'
    },
    {
      path: 'solicitacoes' as ModuloFuncionario,
      titulo: 'Solicitações',
      icone: '▤'
    },
    {
      path: 'servicos' as ModuloFuncionario,
      titulo: 'Serviços e preços',
      icone: '◇'
    },
    {
      path: 'equipe' as ModuloFuncionario,
      titulo: 'Gerir equipe das unidades',
      icone: '♧'
    },
    {
      path: 'unidade' as ModuloFuncionario,
      titulo: 'Gerenciar unidade',
      icone: '⌖'
    }
  ];

  private readonly textos: Record<
    ModuloFuncionario,
    { titulo: string; descricao: string }
  > = {
      painel: {
        titulo: 'Painel inicial',
        descricao: 'Acompanhe as informações gerais da sua unidade.'
      },
      agendamentos: {
        titulo: 'Agendamentos',
        descricao: 'Consulte e acompanhe os agendamentos da sua unidade.'
      },
      disponibilidade: {
        titulo: 'Disponibilidade e horários',
        descricao: 'Configure os dias e horários de funcionamento e atendimento.'
      },
      solicitacoes: {
        titulo: 'Solicitações de agendamento',
        descricao: 'Receba, consulte e responda às solicitações dos clientes.'
      },
      servicos: {
        titulo: 'Serviços e preços',
        descricao: 'Gerencie o catálogo de serviços e seus preços globais.'
      },
      equipe: {
        titulo: 'Gerir equipe das unidades',
        descricao: 'Gerencie os membros vinculados à sua unidade.'
      },
      unidade: {
        titulo: 'Gerenciar unidade',
        descricao: 'Consulte e atualize as informações da sua unidade.'
      }
    };

  readonly tituloAtual = computed(
    () => this.textos[this.modulo()].titulo
  );

  readonly descricaoAtual = computed(
    () => this.textos[this.modulo()].descricao
  );

  constructor() {
    this.carregarPermissoesFuncionario();
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((parametros) => {

        const modulo = parametros.get('modulo');

        const moduloValido = this.menu.some(
          (item) => item.path === modulo
        );

        if (moduloValido) {

          this.modulo.set(modulo as ModuloFuncionario);

          if (
            modulo === 'agendamentos' ||
            modulo === 'solicitacoes'
          ) {
            this.carregarAgendamentos();
          }

          if (modulo === 'unidade') {
            this.carregarUnidades();
          }

          if (modulo === 'disponibilidade') {
            this.carregarDisponibilidade();
          }

        } else {

          this.router.navigate(
            ['/funcionario/painel'],
            { replaceUrl: true }
          );

        }
      });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private carregarUnidades(): void {

    const perfil = this.usuarioAtual()?.role;

    this.carregandoUnidades.set(true);
    this.erroUnidades.set('');
    this.unidades.set([]);

    // ADMIN consulta todas as unidades.
    if (perfil === 'ADMIN') {

      this.lojaService.listarTodasUnidadesAdmin()
        .subscribe({

          next: (lojas) => {
            this.unidades.set(lojas);
            this.carregandoUnidades.set(false);
          },

          error: (erro: HttpErrorResponse) => {
            this.tratarErroUnidades(erro);
          }

        });

      return;
    }

    // EMPLOYEE consulta somente a própria unidade.
    if (perfil === 'EMPLOYEE') {

      this.lojaService.buscarMinhaUnidade()
        .subscribe({

          next: (loja) => {
            this.unidades.set([loja]);
            this.carregandoUnidades.set(false);
          },

          error: (erro: HttpErrorResponse) => {
            this.tratarErroUnidades(erro);
          }

        });

      return;
    }

    this.erroUnidades.set(
      'Seu perfil não possui acesso a esta funcionalidade.'
    );

    this.carregandoUnidades.set(false);
  }


  private tratarErroUnidades(erro: HttpErrorResponse): void {

    this.carregandoUnidades.set(false);

    if (erro.status === 403) {
      this.erroUnidades.set(
        'Você não possui autorização para consultar estas unidades.'
      );
      return;
    }

    if (erro.status === 404) {
      this.erroUnidades.set(
        'Nenhuma unidade vinculada foi encontrada.'
      );
      return;
    }

    if (erro.status === 0) {
      this.erroUnidades.set(
        'Não foi possível conectar ao Backend.'
      );
      return;
    }

    this.erroUnidades.set(
      'Ocorreu um erro ao carregar as unidades.'
    );
  }

  private carregarPermissoesFuncionario(): void {

    if (this.usuarioAtual()?.role !== 'EMPLOYEE') {
      return;
    }

    this.funcionarioAgendamentoService
      .buscarMinhasPermissoes()
      .subscribe({

        next: (resposta) => {
          this.permissoesFuncionario.set(
            resposta.permissions
          );
        },

        error: () => {
          this.permissoesFuncionario.set([]);
        }

      });
  }


  temPermissao(permissao: string): boolean {

    if (this.usuarioAtual()?.role === 'ADMIN') {
      return true;
    }

    return this.permissoesFuncionario().includes(permissao);
  }

  private carregarAgendamentos(): void {

    const perfil = this.usuarioAtual()?.role;

    const filtros: AppointmentFilters = {
      startDate: this.filtroDataInicio() || undefined,
      endDate: this.filtroDataFim() || undefined,
      status: this.filtroStatus() || undefined
    };

    const solicitacoes = this.modulo() === 'solicitacoes';

    this.carregandoAgendamentos.set(true);
    this.erroAgendamentos.set('');
    this.agendamentos.set([]);

    let consulta;

    if (perfil === 'ADMIN') {

      consulta = solicitacoes
        ? this.funcionarioAgendamentoService.listarSolicitacoesAdmin()
        : this.funcionarioAgendamentoService.listarAdmin(filtros);

    } else if (perfil === 'EMPLOYEE') {

      consulta = solicitacoes
        ? this.funcionarioAgendamentoService.listarSolicitacoesFuncionario()
        : this.funcionarioAgendamentoService.listarFuncionario(filtros);

    } else {

      this.erroAgendamentos.set(
        'Perfil sem acesso aos agendamentos.'
      );

      this.carregandoAgendamentos.set(false);
      return;
    }

    consulta.subscribe({

      next: (dados) => {
        this.agendamentos.set(dados);
        this.carregandoAgendamentos.set(false);
      },

      error: (erro: HttpErrorResponse) => {

        this.carregandoAgendamentos.set(false);

        if (erro.status === 403) {
          this.erroAgendamentos.set(
            'Você não possui permissão para consultar os agendamentos.'
          );
        } else if (erro.status === 0) {
          this.erroAgendamentos.set(
            'Não foi possível conectar ao Backend.'
          );
        } else {
          this.erroAgendamentos.set(
            `Erro ao carregar agendamentos. HTTP ${erro.status}.`
          );
        }
      }

    });
  }


  aplicarFiltros(): void {
    this.carregarAgendamentos();
  }


  formatarDataHora(data: string): string {
    return new Date(data).toLocaleString('pt-BR');
  }


  nomeStatus(status: StatusAgendamento): string {

    const nomes: Record<StatusAgendamento, string> = {
      AWAITING_CONFIRMATION: 'Aguardando confirmação',
      CONFIRMED: 'Confirmado',
      CANCELED: 'Cancelado'
    };

    return nomes[status];
  }

  confirmarAgendamento(id: number): void {

    if (!this.temPermissao('APPOINTMENTS_CONFIRM')) {
      return;
    }

    this.processandoAgendamento.set(id);

    const requisicao =
      this.usuarioAtual()?.role === 'ADMIN'
        ? this.funcionarioAgendamentoService.confirmarAdmin(id)
        : this.funcionarioAgendamentoService.confirmarFuncionario(id);

    requisicao.subscribe({

      next: () => {
        this.processandoAgendamento.set(null);
        this.carregarAgendamentos();
      },

      error: () => {
        this.processandoAgendamento.set(null);
        this.erroAgendamentos.set(
          'Não foi possível confirmar o agendamento.'
        );
      }

    });
  }


  recusarAgendamento(id: number): void {

    if (!this.temPermissao('APPOINTMENTS_CONFIRM')) {
      return;
    }

    const confirmar = window.confirm(
      'Deseja realmente recusar esta solicitação?'
    );

    if (!confirmar) {
      return;
    }

    this.processandoAgendamento.set(id);

    const requisicao =
      this.usuarioAtual()?.role === 'ADMIN'
        ? this.funcionarioAgendamentoService.recusarAdmin(id)
        : this.funcionarioAgendamentoService.recusarFuncionario(id);

    requisicao.subscribe({

      next: () => {
        this.processandoAgendamento.set(null);
        this.carregarAgendamentos();
      },

      error: () => {
        this.processandoAgendamento.set(null);
        this.erroAgendamentos.set(
          'Não foi possível recusar o agendamento.'
        );
      }

    });
  }

  private semanaPadrao(): DiaDisponibilidade[] {

    const nomes = [
      'segunda-feira',
      'terça-feira',
      'quarta-feira',
      'quinta-feira',
      'sexta-feira',
      'sábado',
      'domingo'
    ];

    return nomes.map((nome, index) => ({
      dayOfWeek: index + 1,
      dayName: nome,
      closed: true,
      openingTime: null,
      closingTime: null,
      breakStart: null,
      breakEnd: null
    }));
  }

  private carregarDisponibilidade(): void {

    const perfil = this.usuarioAtual()?.role;

    this.carregandoDisponibilidade.set(true);
    this.erroDisponibilidade.set('');
    this.sucessoDisponibilidade.set('');

    this.diasDisponibilidade.set(this.semanaPadrao());

    // ADMIN pode selecionar qualquer unidade.
    if (perfil === 'ADMIN') {

      this.lojaService.listarTodasUnidadesAdmin()
        .subscribe({

          next: (lojas) => {

            this.unidades.set(lojas);

            if (lojas.length === 0) {

              this.erroDisponibilidade.set(
                'Não existem unidades cadastradas.'
              );

              this.carregandoDisponibilidade.set(false);
              return;
            }

            const storeId =
              this.disponibilidadeStoreId() ?? lojas[0].id;

            this.selecionarUnidadeDisponibilidade(storeId);

          },

          error: () => {

            this.erroDisponibilidade.set(
              'Não foi possível carregar as unidades.'
            );

            this.carregandoDisponibilidade.set(false);
          }
        });

      return;
    }

    // EMPLOYEE só consulta a própria unidade.
    if (perfil === 'EMPLOYEE') {

      this.lojaService.buscarMinhaUnidade()
        .subscribe({

          next: (loja) => {

            this.disponibilidadeStoreId.set(loja.id);
            this.nomeUnidadeDisponibilidade.set(loja.nome);

            this.carregarHorariosFuncionario();
          },

          error: (erro: HttpErrorResponse) => {

            this.tratarErroDisponibilidade(erro);
          }
        });

      return;
    }

    this.erroDisponibilidade.set(
      'Perfil sem acesso à disponibilidade.'
    );

    this.carregandoDisponibilidade.set(false);
  }


  selecionarUnidadeDisponibilidade(storeId: number): void {

    this.disponibilidadeStoreId.set(storeId);

    const loja = this.unidades().find(
      item => item.id === storeId
    );

    this.nomeUnidadeDisponibilidade.set(
      loja?.nome || ''
    );

    this.carregandoDisponibilidade.set(true);
    this.erroDisponibilidade.set('');
    this.sucessoDisponibilidade.set('');

    this.diasDisponibilidade.set(this.semanaPadrao());

    this.disponibilidadeService
      .buscarDisponibilidadeAdmin(storeId)
      .subscribe({

        next: (dias) => {

          this.diasDisponibilidade.set(dias);

          this.carregandoDisponibilidade.set(false);
        },

        error: (erro: HttpErrorResponse) => {

          this.tratarErroDisponibilidade(erro);
        }
      });
  }


  private carregarHorariosFuncionario(): void {

    this.disponibilidadeService
      .buscarMinhaDisponibilidade()
      .subscribe({

        next: (dias) => {

          this.diasDisponibilidade.set(dias);

          this.carregandoDisponibilidade.set(false);
        },

        error: (erro: HttpErrorResponse) => {

          this.tratarErroDisponibilidade(erro);
        }
      });
  }


  private tratarErroDisponibilidade(
    erro: HttpErrorResponse
  ): void {

    this.carregandoDisponibilidade.set(false);

    if (erro.status === 403) {

      this.erroDisponibilidade.set(
        'Você não possui a permissão AVAILABILITY_MANAGE.'
      );

    } else if (erro.status === 404) {

      this.erroDisponibilidade.set(
        'Não foi encontrada uma unidade vinculada ao usuário.'
      );

    } else if (erro.status === 0) {

      this.erroDisponibilidade.set(
        'Não foi possível conectar ao Backend.'
      );

    } else {

      this.erroDisponibilidade.set(
        `Erro ao consultar disponibilidade. HTTP ${erro.status}.`
      );
    }
  }

  atualizarDiaDisponibilidade(
    dayOfWeek: number,
    alteracoes: Partial<DiaDisponibilidade>
  ): void {

    this.sucessoDisponibilidade.set('');
    this.erroDisponibilidade.set('');

    this.diasDisponibilidade.update(dias =>
      dias.map(dia => {

        if (dia.dayOfWeek !== dayOfWeek) {
          return dia;
        }

        const atualizado = {
          ...dia,
          ...alteracoes
        };

        if (alteracoes.closed === true) {

          atualizado.openingTime = null;
          atualizado.closingTime = null;
          atualizado.breakStart = null;
          atualizado.breakEnd = null;

        }

        if (alteracoes.closed === false) {

          atualizado.openingTime = '09:00';
          atualizado.closingTime = '18:00';
          atualizado.breakStart = null;
          atualizado.breakEnd = null;

        }

        return atualizado;
      })
    );
  }

  salvarDisponibilidade(): void {

    const perfil = this.usuarioAtual()?.role;

    const dias = this.diasDisponibilidade();

    if (dias.length !== 7) {

      this.erroDisponibilidade.set(
        'Configure todos os dias da semana.'
      );

      return;
    }

    if (
      perfil === 'ADMIN' &&
      this.disponibilidadeStoreId() === null
    ) {

      this.erroDisponibilidade.set(
        'Selecione uma unidade.'
      );

      return;
    }

    this.salvandoDisponibilidade.set(true);
    this.erroDisponibilidade.set('');
    this.sucessoDisponibilidade.set('');

    const requisicao =
      perfil === 'ADMIN'
        ? this.disponibilidadeService.salvarDisponibilidadeAdmin(
          this.disponibilidadeStoreId()!,
          dias
        )
        : this.disponibilidadeService.salvarMinhaDisponibilidade(dias);

    requisicao.subscribe({

      next: (resposta) => {

        this.diasDisponibilidade.set(resposta);

        this.salvandoDisponibilidade.set(false);

        this.sucessoDisponibilidade.set(
          'Horários salvos com sucesso!'
        );
      },

      error: (erro: HttpErrorResponse) => {

        this.salvandoDisponibilidade.set(false);

        if (erro.status === 400) {

          this.erroDisponibilidade.set(
            'Verifique os horários informados. A abertura deve ser anterior ao fechamento e o intervalo precisa estar dentro do expediente.'
          );

        } else if (erro.status === 403) {

          this.erroDisponibilidade.set(
            'Você não possui permissão para alterar os horários.'
          );

        } else {

          this.erroDisponibilidade.set(
            'Não foi possível salvar a disponibilidade.'
          );
        }
      }
    });
  }
}