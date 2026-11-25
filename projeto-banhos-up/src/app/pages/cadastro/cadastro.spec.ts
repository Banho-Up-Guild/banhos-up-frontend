import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cadastro } from './cadastro';

describe('Cadastro', () => {
  let component: Cadastro;
  let fixture: ComponentFixture<Cadastro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cadastro]
    }).compileComponents();

    fixture = TestBed.createComponent(Cadastro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve alternar a visibilidade da senha', () => {
    expect(component.mostrarSenha()).toBe(false);

    component.alternarVisibilidadeSenha();

    expect(component.mostrarSenha()).toBe(true);
  });

  it('deve alternar a visibilidade da confirmação de senha', () => {
    expect(component.mostrarConfirmacaoSenha()).toBe(false);

    component.alternarVisibilidadeConfirmacao();

    expect(component.mostrarConfirmacaoSenha()).toBe(true);
  });

  it('deve validar um nome preenchido', () => {
    component.nome = 'Maria Silva';

    expect(component.nomeValido).toBe(true);
  });

  it('deve identificar um nome vazio como inválido', () => {
    component.nome = '';

    expect(component.nomeValido).toBe(false);
  });

  it('deve validar um CPF correto', () => {
    component.cpf = '529.982.247-25';

    expect(component.cpfValido).toBe(true);
  });

  it('deve identificar um CPF incorreto', () => {
    component.cpf = '111.111.111-11';

    expect(component.cpfValido).toBe(false);
  });

  it('deve validar um e-mail preenchido', () => {
    component.email = 'usuario@email';

    expect(component.emailValido).toBe(true);
  });

  it('deve validar um celular com DDD e 9 dígitos', () => {
    component.celular = '(11) 99999-9999';

    expect(component.celularValido).toBe(true);
  });

  it('deve identificar um celular incompleto', () => {
    component.celular = '(11) 9999-9999';

    expect(component.celularValido).toBe(false);
  });

  it('deve identificar a data de nascimento vazia como inválida', () => {
    component.nascimento = '';

    expect(component.nascimentoValido).toBe(false);
  });

  it('deve identificar uma pessoa com menos de 18 anos', () => {
    const hoje = new Date();

    const nascimento = new Date(
      hoje.getFullYear() - 17,
      hoje.getMonth(),
      hoje.getDate()
    );

    component.nascimento =
      `${nascimento.getFullYear()}-${String(nascimento.getMonth() + 1).padStart(2, '0')}-${String(nascimento.getDate()).padStart(2, '0')}`;

    expect(component.nascimentoValido).toBe(false);
  });

  it('deve identificar uma pessoa com 18 anos completos', () => {
    const hoje = new Date();

    const nascimento = new Date(
      hoje.getFullYear() - 18,
      hoje.getMonth(),
      hoje.getDate()
    );

    component.nascimento =
      `${nascimento.getFullYear()}-${String(nascimento.getMonth() + 1).padStart(2, '0')}-${String(nascimento.getDate()).padStart(2, '0')}`;

    expect(component.nascimentoValido).toBe(true);
  });

  it('deve identificar uma data futura como inválida', () => {
    const hoje = new Date();

    const nascimento = new Date(
      hoje.getFullYear() + 1,
      hoje.getMonth(),
      hoje.getDate()
    );

    component.nascimento =
      `${nascimento.getFullYear()}-${String(nascimento.getMonth() + 1).padStart(2, '0')}-${String(nascimento.getDate()).padStart(2, '0')}`;

    expect(component.nascimentoValido).toBe(false);
  });

  it('deve identificar uma data inexistente como inválida', () => {
    component.nascimento = '2000-02-31';

    expect(component.nascimentoValido).toBe(false);
  });

  it('deve validar uma senha com todos os requisitos', () => {
    component.senha = 'Banhos@123';

    expect(component.senhaMinima).toBe(true);
    expect(component.senhaMaiuscula).toBe(true);
    expect(component.senhaMinuscula).toBe(true);
    expect(component.senhaEspecial).toBe(true);
    expect(component.senhaNumero).toBe(true);
    expect(component.senhaValida).toBe(true);
  });

  it('deve identificar uma senha sem os requisitos', () => {
    component.senha = 'banhos123';

    expect(component.senhaMaiuscula).toBe(false);
    expect(component.senhaEspecial).toBe(false);
    expect(component.senhaValida).toBe(false);
  });

  it('deve validar senhas iguais', () => {
    component.senha = 'Banhos@123';
    component.confirmarSenha = 'Banhos@123';

    expect(component.confirmacaoValida).toBe(true);
  });

  it('deve identificar senhas diferentes', () => {
    component.senha = 'Banhos@123';
    component.confirmarSenha = 'Banhos@456';

    expect(component.confirmacaoValida).toBe(false);
  });

  it('deve exigir o aceite dos termos', () => {
    component.termos = false;

    expect(component.formularioValido).toBe(false);
  });

  it('deve exibir tentativa de cadastro quando os campos estiverem inválidos', () => {
    component.cadastrar();

    expect(component.tentouCadastrar).toBe(true);
    expect(component.formularioValido).toBe(false);
  });
});