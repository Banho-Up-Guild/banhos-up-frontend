import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  LucideTriangleExclamationPoint,
  LucideDog,
  LucideCat,
  LucideBubbles,
  LucideStore,
  LucideCalendar,
  LucideClock,
  LucideDollarSign
} from '@lucide/angular';

export const MAX_PETS_POR_AGENDAMENTO = 3;

export interface PetAgendamento {
  nome: string;
  tipoPet: 'cachorro' | 'gato' | 'outro';
}

type StatusAgendamento = 'agendado' | 'cancelado' | 'realizado';
type AbaAgendamentos = 'proximos' | 'anteriores';

interface Agendamento {
  id: number;
  pets: PetAgendamento[];
  loja: string;
  data: string;
  horario: string;
  pagamento: string;
  status: StatusAgendamento;
}

@Component({
  selector: 'app-meus-agendamentos',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    LucideTriangleExclamationPoint,
    LucideDog,
    LucideCat,
    LucideBubbles,
    LucideStore,
    LucideCalendar,
    LucideClock,
    LucideDollarSign
  ],
  templateUrl: './meus-agendamentos.html',
  styleUrl: './meus-agendamentos.css'
})
export class MeusAgendamentos {
  readonly limitePets = MAX_PETS_POR_AGENDAMENTO;

  abaAtiva = signal<AbaAgendamentos>('proximos');

  agendamentos = signal<Agendamento[]>([
    {
      id: 1,
      pets: [
        { nome: 'Pet 1', tipoPet: 'cachorro' }
      ],
      loja: 'BanhosUp Diadema',
      data: '2026-12-17',
      horario: '09:30 até 11:00',
      pagamento: 'Pendente',
      status: 'agendado'
    },
    {
      id: 2,
      pets: [
        { nome: 'Pet 2', tipoPet: 'gato' }
      ],
      loja: 'BanhosUp Diadema',
      data: '2026-09-20',
      horario: '10:00 até 11:30',
      pagamento: 'Cancelado',
      status: 'cancelado'
    },
    {
      id: 3,
      pets: [
        { nome: 'Pet 3', tipoPet: 'outro' }
      ],
      loja: 'BanhosUp Diadema',
      data: '2026-09-15',
      horario: '14:00 até 15:30',
      pagamento: 'Pago',
      status: 'realizado'
    },
    {
      id: 4,
      pets: [
        { nome: 'Pet 4', tipoPet: 'cachorro' },
        { nome: 'Pet 5', tipoPet: 'cachorro' },
        { nome: 'Pet 6', tipoPet: 'cachorro' }
      ],
      loja: 'BanhosUp Diadema',
      data: '2026-12-03',
      horario: '09:30 até 11:00',
      pagamento: 'Pendente',
      status: 'agendado'
    },
    {
      id: 5,
      pets: [
        { nome: 'Pet 7', tipoPet: 'gato' },
        { nome: 'Pet 8', tipoPet: 'outro' }
      ],
      loja: 'BanhosUp Diadema',
      data: '2026-12-05',
      horario: '14:00 até 15:30',
      pagamento: 'Pendente',
      status: 'agendado'
    }
  ]);

  modalReagendarAberto = signal(false);
  modalCancelarAberto = signal(false);

  agendamentoSelecionado: number | null = null;

  novaData = '';
  novoHorario = '';

  tentouSalvarReagendamento = false;

  get agendamentosProximos(): Agendamento[] {
    return this.agendamentos().filter(
      agendamento => agendamento.status === 'agendado'
    );
  }

  get agendamentosAnteriores(): Agendamento[] {
    return this.agendamentos().filter(
      agendamento =>
        agendamento.status === 'cancelado' ||
        agendamento.status === 'realizado'
    );
  }

  get agendamentosExibidos(): Agendamento[] {
    return this.abaAtiva() === 'proximos'
      ? this.agendamentosProximos
      : this.agendamentosAnteriores;
  }

  selecionarAba(aba: AbaAgendamentos): void {
    this.abaAtiva.set(aba);
  }

  quantidadePetsValida(pets: PetAgendamento[]): boolean {
    return pets.length >= 1 && pets.length <= this.limitePets;
  }

  formatarNomesPets(pets: PetAgendamento[]): string {
    const nomes = pets.map(pet => pet.nome);

    if (nomes.length === 1) {
      return nomes[0];
    }

    if (nomes.length === 2) {
      return `${nomes[0]} e ${nomes[1]}`;
    }

    return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`;
  }

  abrirModalReagendar(agendamento: Agendamento): void {
    this.agendamentoSelecionado = agendamento.id;
    this.novaData = agendamento.data;
    this.novoHorario = agendamento.horario.split(' até ')[0];
    this.tentouSalvarReagendamento = false;

    this.modalReagendarAberto.set(true);
  }

  fecharModalReagendar(): void {
    this.modalReagendarAberto.set(false);
    this.agendamentoSelecionado = null;
    this.novaData = '';
    this.novoHorario = '';
    this.tentouSalvarReagendamento = false;
  }

  salvarReagendamento(): void {
    this.tentouSalvarReagendamento = true;

    if (!this.novaData || !this.novoHorario) {
      return;
    }

    const dataSelecionada = new Date(`${this.novaData}T00:00:00`);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(dataSelecionada.getTime()) ||
      dataSelecionada < hoje
    ) {
      return;
    }

    this.agendamentos.update(lista =>
      lista.map(agendamento =>
        agendamento.id === this.agendamentoSelecionado
          ? {
              ...agendamento,
              data: this.novaData,
              horario: `${this.novoHorario} até ${this.calcularHorarioFinal(this.novoHorario)}`
            }
          : agendamento
      )
    );

    this.fecharModalReagendar();
  }

  calcularHorarioFinal(horarioInicial: string): string {
    const [hora, minuto] = horarioInicial.split(':').map(Number);

    const totalMinutos = hora * 60 + minuto + 90;
    const horaFinal = Math.floor(totalMinutos / 60) % 24;
    const minutoFinal = totalMinutos % 60;

    return `${String(horaFinal).padStart(2, '0')}:${String(minutoFinal).padStart(2, '0')}`;
  }

  abrirModalCancelar(agendamento: Agendamento): void {
    this.agendamentoSelecionado = agendamento.id;
    this.modalCancelarAberto.set(true);
  }

  fecharModalCancelar(): void {
    this.modalCancelarAberto.set(false);
    this.agendamentoSelecionado = null;
  }

  confirmarCancelamento(): void {
    if (this.agendamentoSelecionado === null) {
      return;
    }

    this.agendamentos.update(lista =>
      lista.map(agendamento =>
        agendamento.id === this.agendamentoSelecionado
          ? { ...agendamento, status: 'cancelado' as StatusAgendamento }
          : agendamento
      )
    );

    this.fecharModalCancelar();
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataFormatada = new Date(ano, mes - 1, dia);

    const diaSemana = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long'
    }).format(dataFormatada);

    const dataNumerica =
      `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;

    return `${diaSemana.charAt(0).toUpperCase()}${diaSemana.slice(1)}, ${dataNumerica}`;
  }

  get dataMinima(): string {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }
}