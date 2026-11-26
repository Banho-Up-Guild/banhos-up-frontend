import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeoutError, finalize, timeout } from 'rxjs';

import {
  AgendamentoClienteResponse,
  MeusAgendamentosService,
  StatusAgendamentoCliente,
} from '../../../../services/meus-agendamentos.service';

type FiltroStatus = 'TODOS' | StatusAgendamentoCliente;

@Component({
  selector: 'app-meus-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
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

    if (filtro === 'TODOS') {
      return lista;
    }

    return lista.filter(
      agendamento => agendamento.status === filtro
    );
  });

  ngOnInit(): void {
    this.carregarAgendamentos();
  }

  mudarFiltro(status: FiltroStatus): void {
    this.filtroStatus.set(status);
  }

  carregarAgendamentos(): void {

    this.carregando.set(true);
    this.erro.set('');

    this.service.listar()
      .pipe(
        timeout({ first: 20000 }),
        finalize(() => this.carregando.set(false))
      )
      .subscribe({

        next: (resposta: AgendamentoClienteResponse[]) => {

          const lista = Array.isArray(resposta) ? resposta : [];

          this.agendamentos.set(
            [...lista].sort(
              (a, b) =>
                new Date(b.dateTimeAppointment).getTime() -
                new Date(a.dateTimeAppointment).getTime()
            )
          );
        },

        error: (erro: unknown) => {

          console.error('Erro ao carregar agendamentos:', erro);

          if (erro instanceof TimeoutError) {
            this.erro.set(
              'O servidor demorou para responder. Tente novamente.'
            );
            return;
          }

          if (erro instanceof HttpErrorResponse) {

            if (erro.status === 401 || erro.status === 403) {
              this.erro.set(
                'Sua sessão não está válida. Entre novamente na sua conta.'
              );
              return;
            }

            if (erro.status === 0) {
              this.erro.set(
                'Não foi possível conectar ao Backend. Verifique se o servidor está ligado.'
              );
              return;
            }

            this.erro.set(
              erro.error?.message ||
              'Não foi possível carregar seus agendamentos.'
            );

            return;
          }

          this.erro.set(
            'Ocorreu um erro inesperado ao carregar seus agendamentos.'
          );
        }
      });
  }

  statusDescricao(status: StatusAgendamentoCliente): string {

    switch (status) {
      case 'CONFIRMED':
        return 'Confirmado';

      case 'CANCELED':
        return 'Cancelado';

      case 'AWAITING_CONFIRMATION':
        return 'Aguardando confirmação';

      default:
        return status;
    }
  }

  classeStatus(status: StatusAgendamentoCliente): string {

    switch (status) {
      case 'CONFIRMED':
        return 'status--confirmado';

      case 'CANCELED':
        return 'status--cancelado';

      default:
        return 'status--aguardando';
    }
  }
}