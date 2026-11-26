import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';

import { Funcionario } from './funcionario';

describe('Funcionario', () => {
  let component: Funcionario;
  let fixture: ComponentFixture<Funcionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Funcionario],
      providers: [
        provideRouter([]),
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => 'painel' }), snapshot: { paramMap: { get: () => 'painel' } } } },
        { provide: AuthService, useValue: { usuarioAtual: () => ({ role: 'EMPLOYEE' }), logout: () => undefined } },
        {
          provide: DashboardService,
          useValue: {
            buscarResumoFuncionario: () => of({
              agendamentosHoje: 4,
              solicitacoesPendentes: 2,
              servicosCadastrados: 6,
              membrosEquipe: 3
            }),
            buscarResumoAdmin: () => of({
              agendamentosHoje: 4,
              solicitacoesPendentes: 2,
              servicosCadastrados: 6,
              membrosEquipe: 3
            })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Funcionario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os indicadores do painel', async () => {
    await fixture.whenStable();
    expect(component.dashboard()?.agendamentosHoje).toBe(4);
    expect(component.dashboard()?.solicitacoesPendentes).toBe(2);
    expect(component.dashboard()?.servicosCadastrados).toBe(6);
    expect(component.dashboard()?.membrosEquipe).toBe(3);
  });
});
