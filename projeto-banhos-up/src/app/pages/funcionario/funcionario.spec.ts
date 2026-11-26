import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';

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
        { provide: AuthService, useValue: { usuarioAtual: () => ({ role: 'EMPLOYEE' }), logout: () => undefined } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Funcionario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
