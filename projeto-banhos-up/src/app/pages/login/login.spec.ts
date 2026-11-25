import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
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

  it('deve identificar um campo de e-mail preenchido como válido', () => {
    component.emailCpf = 'usuario@email';

    expect(component.identificadorValido).toBe(true);
  });

  it('deve identificar um CPF válido', () => {
    component.emailCpf = '529.982.247-25';

    expect(component.identificadorValido).toBe(true);
  });

  it('deve identificar um CPF inválido', () => {
    component.emailCpf = '111.111.111-11';

    expect(component.identificadorValido).toBe(false);
  });

  it('deve identificar o campo de identificação vazio como inválido', () => {
    component.emailCpf = '';

    expect(component.identificadorValido).toBe(false);
  });

  it('deve identificar uma senha preenchida como válida', () => {
    component.senha = '123456';

    expect(component.senhaValida).toBe(true);
  });

  it('deve identificar uma senha vazia como inválida', () => {
    component.senha = '';

    expect(component.senhaValida).toBe(false);
  });

  it('deve impedir a tentativa de login com campos inválidos', () => {
    component.emailCpf = '';
    component.senha = '';

    component.entrar();

    expect(component.tentouEntrar).toBe(true);
    expect(component.formularioValido).toBe(false);
  });

  it('deve permitir a validação quando os campos estiverem preenchidos corretamente', () => {
    component.emailCpf = '529.982.247-25';
    component.senha = '123456';

    component.entrar();

    expect(component.tentouEntrar).toBe(true);
    expect(component.formularioValido).toBe(true);
  });
});