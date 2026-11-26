import '@angular/compiler';

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { AgendamentoApiService } from './agendamento-api.service';
import { environment } from '../../environments/environment';

describe('AgendamentoApiService', () => {
  let service: AgendamentoApiService;
  let injector: Injector;
  let http: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    http = {
      get: vi.fn().mockReturnValue(of([])),
      post: vi.fn().mockReturnValue(of({}))
    };
    injector = Injector.create({
      providers: [{ provide: HttpClient, useValue: http }]
    });
    service = runInInjectionContext(
      injector,
      () => new AgendamentoApiService()
    );
  });

  afterEach(() => injector.destroy());

  it('envia employeeId=0 no calendário quando não há preferência profissional', () => {
    service.listarDisponibilidade('2026-12', 1, 30, 0).subscribe();

    expect(http.get).toHaveBeenCalledWith(
      `${environment.apiUrl}/availability/calendar`,
      { params: expect.any(HttpParams) }
    );
    const params = http.get.mock.calls[0][1].params as HttpParams;
    expect(params.get('storeId')).toBe('1');
    expect(params.get('employeeId')).toBe('0');
    expect(params.get('yearMonth')).toBe('2026-12');
    expect(params.get('durationMinutes')).toBe('30');
  });

  it('envia o profissional selecionado no calendário', () => {
    service.listarDisponibilidade('2026-12', 1, 45, 7).subscribe();

    const params = http.get.mock.calls[0][1].params as HttpParams;
    expect(params.get('employeeId')).toBe('7');
    expect(params.get('durationMinutes')).toBe('45');
  });

  it('consulta a recomendação com data, horário e duração reais', () => {
    service.recomendarProfissional(1, '15-12-2026 10:30', 45, 7).subscribe();

    expect(http.get).toHaveBeenCalledWith(
      `${environment.apiUrl}/availability/employee`,
      { params: expect.any(HttpParams) }
    );
    const params = http.get.mock.calls[0][1].params as HttpParams;
    expect(params.get('storeId')).toBe('1');
    expect(params.get('dateTime')).toBe('15-12-2026 10:30');
    expect(params.get('durationMinutes')).toBe('45');
    expect(params.get('employeeId')).toBe('7');
  });

  it('envia employeeId=0 na recomendação quando não há preferência', () => {
    service.recomendarProfissional(1, '15-12-2026 10:30', 45, 0).subscribe();

    const params = http.get.mock.calls[0][1].params as HttpParams;
    expect(params.get('employeeId')).toBe('0');
  });

  it('envia o profissional recomendado e os IDs dos pets e serviços no cadastro', () => {
    const dados = {
      dateTimeAppointment: '2026-12-15T10:30:00',
      status: 'AWAITING_CONFIRMATION' as const,
      observation: '',
      employeeId: 7,
      petOffering: [{ petId: 3, offeringIds: [2, 4] }]
    };

    service.criarAgendamento(dados).subscribe();

    expect(http.post).toHaveBeenCalledWith(
      `${environment.apiUrl}/appointments`,
      dados
    );
  });
});
