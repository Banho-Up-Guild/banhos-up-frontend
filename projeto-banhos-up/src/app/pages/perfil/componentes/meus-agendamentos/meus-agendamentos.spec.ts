import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MeusAgendamentos } from './meus-agendamentos';
import {
  AgendamentoClienteResponse,
  MeusAgendamentosService
} from '../../../../services/meus-agendamentos.service';

const agendamentos: AgendamentoClienteResponse[] = [
  {
    id: 1,
    dateTimeAppointment: '2026-12-15T10:30:00',
    status: 'CONFIRMED',
    observation: null,
    totalPrice: 170,
    employeeId: 2,
    employeeName: 'Ana',
    customerName: 'Cliente',
    customerEmail: 'cliente@email.com',
    items: [
      { petId: 1, petName: 'Rex', species: 'Cachorro', offeringId: 1, offeringName: 'Banho', offeringPrice: 170 }
    ]
  },
  {
    id: 2,
    dateTimeAppointment: '2026-01-10T09:00:00',
    status: 'CANCELED',
    observation: null,
    totalPrice: 100,
    employeeId: 2,
    employeeName: 'Ana',
    customerName: 'Cliente',
    customerEmail: 'cliente@email.com',
    items: [
      { petId: 2, petName: 'Mel', species: 'Gato', offeringId: 1, offeringName: 'Banho', offeringPrice: 100 }
    ]
  }
];

describe('MeusAgendamentos', () => {
  let component: MeusAgendamentos;
  let fixture: ComponentFixture<MeusAgendamentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusAgendamentos],
      providers: [
        provideRouter([]),
        { provide: MeusAgendamentosService, useValue: { listar: () => of(agendamentos) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MeusAgendamentos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os agendamentos do cliente', async () => {
    await fixture.whenStable();
    expect(component.agendamentos().length).toBe(2);
  });

  it('deve iniciar sem filtro adicional', () => {
    expect(component.filtroStatus()).toBe('TODOS');
  });

  it('deve filtrar agendamentos por status', () => {
    component.mudarFiltro('CANCELED');
    expect(component.agendamentosFiltrados().length).toBe(1);
    expect(component.agendamentosFiltrados()[0].status).toBe('CANCELED');
  });

  it('deve voltar a listar todos os agendamentos', () => {
    component.mudarFiltro('CONFIRMED');
    component.mudarFiltro('TODOS');
    expect(component.agendamentosFiltrados().length).toBe(2);
  });

  it('deve retornar os itens de um agendamento', () => {
    expect(component.itensDoAgendamento(agendamentos[0]).length).toBe(1);
  });

  it('deve formatar os nomes dos pets', () => {
    expect(component.formatarNomesPets(agendamentos[0].items)).toBe('Rex');
  });

  it('deve formatar data e horário', () => {
    expect(component.formatarData('2026-12-15T10:30:00')).not.toBe('Data não disponível');
    expect(component.formatarHora('2026-12-15T10:30:00')).not.toBe('Horário não disponível');
  });

  it('deve formatar preço', () => {
    expect(component.formatarPreco(170)).toContain('170');
  });

  it('deve traduzir status conhecidos', () => {
    expect(component.statusDescricao('CONFIRMED')).toBe('Confirmado');
    expect(component.statusDescricao('CANCELED')).toBe('Cancelado');
  });
});
