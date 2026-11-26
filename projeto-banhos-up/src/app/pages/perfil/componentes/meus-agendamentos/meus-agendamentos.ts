import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TimeoutError, finalize, timeout } from 'rxjs';
import {
  AgendamentoClienteResponse,
  ItemAgendamentoCliente,
  MeusAgendamentosService,
  StatusAgendamentoCliente
} from '../../../../services/meus-agendamentos.service';

type FiltroStatus = 'TODOS' | StatusAgendamentoCliente;

@Component({
  selector: 'app-meus-agendamentos',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './meus-agendamentos.html',
  styleUrl: './meus-agendamentos.css'
})
export class MeusAgendamentos implements OnInit {
  private readonly service = inject(MeusAgendamentosService);

  readonly agendamentos = signal<AgendamentoClienteResponse[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly filtroStatus = signal<FiltroStatus>('TODOS');

  readonly agendamentosFiltrados = computed(() => {
    const filtro = this.filtroStatus();
    const lista = this.agendamentos();
    if (filtro === 'TODOS') return lista;
    return lista.filter(item => item.status === filtro);
  });

  ngOnInit(): void { this.carregarAgendamentos(); }

  mudarFiltro(status: FiltroStatus): void { this.filtroStatus.set(status); }

  carregarAgendamentos(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.service.listar()
      .pipe(timeout({ first: 20000 }), finalize(() => this.carregando.set(false)))
      .subscribe({
        next: resposta => {
          const lista = Array.isArray(resposta) ? resposta : [];
          this.agendamentos.set([...lista].sort((a, b) =>
            new Date(b.dateTimeAppointment).getTime() - new Date(a.dateTimeAppointment).getTime()));
        },
        error: (erro: unknown) => {
          console.error('Erro ao carregar agendamentos:', erro);
          if (erro instanceof TimeoutError) {
            this.erro.set('O servidor demorou para responder. Tente novamente.');
          } else if (erro instanceof HttpErrorResponse && (erro.status === 401 || erro.status === 403)) {
            this.erro.set('Sua sessão não está válida. Entre novamente na sua conta.');
          } else if (erro instanceof HttpErrorResponse && erro.status === 0) {
            this.erro.set('Não foi possível conectar ao Backend. Verifique se o servidor está ligado.');
          } else if (erro instanceof HttpErrorResponse) {
            this.erro.set(erro.error?.message || 'Não foi possível carregar seus agendamentos.');
          } else {
            this.erro.set('Ocorreu um erro inesperado ao carregar seus agendamentos.');
          }
        }
      });
  }

  itensDoAgendamento(agendamento: AgendamentoClienteResponse): ItemAgendamentoCliente[] {
    return Array.isArray(agendamento.items) ? agendamento.items : [];
  }

  formatarNomesPets(items: ItemAgendamentoCliente[]): string {
    const nomes = [...new Set(items.map(item => item.petName).filter(Boolean))];
    return nomes.length ? nomes.join(', ') : 'Pet não informado';
  }

  formatarData(valor: string): string {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return 'Data não disponível';
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(data);
  }

  formatarHora(valor: string): string {
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return 'Horário não disponível';
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(data);
  }

  formatarPreco(valor: number | string | null | undefined): string {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);
  }

  statusDescricao(status: StatusAgendamentoCliente): string {
    switch (status) {
      case 'CONFIRMED': return 'Confirmado';
      case 'CANCELED': return 'Cancelado';
      case 'AWAITING_CONFIRMATION': return 'Aguardando confirmação';
      default: return status;
    }
  }

  classeStatus(status: StatusAgendamentoCliente): string {
    switch (status) {
      case 'CONFIRMED': return 'status-realizado';
      case 'CANCELED': return 'status-cancelado';
      default: return 'status-agendado';
    }
  }
}