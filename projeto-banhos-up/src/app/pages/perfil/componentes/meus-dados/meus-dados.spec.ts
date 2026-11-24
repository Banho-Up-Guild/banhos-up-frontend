import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeusDados } from './meus-dados';

describe('MeusDados', () => {
  let component: MeusDados;
  let fixture: ComponentFixture<MeusDados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusDados]
    }).compileComponents();

    fixture = TestBed.createComponent(MeusDados);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com os dados mocados', () => {
    expect(component.dados.nome).toBe('User');
    expect(component.dados.cpf).toBe('529.982.247-25');
    expect(component.dados.genero).toBe('Feminino');
  });

  it('deve validar um CPF correto', () => {
    expect(component.cpfValido).toBe(true);
  });

  it('deve identificar um CPF inválido', () => {
    component.dados.cpf = '111.111.111-11';

    expect(component.cpfValido).toBe(false);
  });

  it('deve validar a data de nascimento', () => {
    expect(component.nascimentoValido).toBe(true);
  });

  it('deve identificar uma data inválida', () => {
    component.dados.nascimento = '31/02/2000';

    expect(component.nascimentoValido).toBe(false);
  });

  it('deve identificar um celular incompleto', () => {
    component.dados.celular = '9999-9999';

    expect(component.celularValido).toBe(false);
  });

  it('deve permitir telefone opcional vazio', () => {
    component.dados.dddTelefone = '';
    component.dados.telefone = '';

    expect(component.telefoneValido).toBe(true);
  });

  it('deve impedir o salvamento com dados inválidos', () => {
    component.dados.cpf = '111.111.111-11';

    component.salvar();

    expect(component.tentouSalvar).toBe(true);
    expect(component.salvou).toBe(false);
  });

  it('deve permitir o salvamento com dados válidos', () => {
    component.salvar();

    expect(component.formularioValido).toBe(true);
    expect(component.salvou).toBe(true);
  });
});
