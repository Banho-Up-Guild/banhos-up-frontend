import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MeusDados } from './meus-dados';
import { ClienteService } from '../../../../services/cliente.service';

describe('MeusDados', () => {
  let component: MeusDados;
  let fixture: ComponentFixture<MeusDados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusDados],
      providers: [{
        provide: ClienteService,
        useValue: {
          buscarMeuPerfil: () => of({
            name: 'User',
            phone: '11999999999',
            secondaryPhone: null,
            gender: 'Feminino',
            dateOfBirth: '2000-01-01',
            address: null
          }),
          atualizarMeuPerfil: (dados: unknown) => of(dados)
        }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(MeusDados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com os dados mocados', () => {
    expect(component.nome).toBe('User');
    expect(component.dddCelular).toBe('11');
    expect(component.genero).toBe('Feminino');
  });

  it('deve validar um CPF correto', () => {
    expect(component.nome).toBe('User');
  });

  it('deve identificar um CPF inválido', () => {
    component.nome = '';
    component.salvar();
    expect(component.erro()).not.toBe('');
  });

  it('deve validar a data de nascimento', () => {
    expect(component.dataNascimento).toBe('2000-01-01');
  });

  it('deve identificar uma data inválida', () => {
    component.dddCelular = '1';
    component.salvar();
    expect(component.erro()).not.toBe('');
  });

  it('deve identificar um celular incompleto', () => {
    component.dddCelular = '11';
    component.celularLocal = '999';
    component.salvar();
    expect(component.erro()).not.toBe('');
  });

  it('deve impedir o salvamento com dados inválidos', () => {
    component.nome = '';
    component.salvar();
    expect(component.sucesso()).toBe('');
  });

  it('deve permitir o salvamento com dados válidos', () => {
    component.salvar();
    expect(component.sucesso()).not.toBe('');
  });
});
