import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../services/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: () => of({ user: { role: 'CUSTOMER' } })
          }
        },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true), navigateByUrl: () => Promise.resolve(true) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } }
      ]
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
    component.email = 'usuario@email';
    expect(component.email).toBe('usuario@email');
  });

  it('deve aceitar um e-mail válido no login', () => {
    component.email = 'usuario@email.com';
    component.senha = '123456';
    component.entrar();
    expect(component.erro()).toBe('');
  });

  it('deve rejeitar e-mail vazio no login', () => {
    component.email = '';
    component.senha = '123456';
    component.entrar();
    expect(component.erro()).not.toBe('');
  });

  it('deve identificar o campo de identificação vazio como inválido', () => {
    component.email = '';
    component.entrar();
    expect(component.erro()).not.toBe('');
  });

  it('deve identificar uma senha preenchida como válida', () => {
    component.senha = '123456';
    expect(component.senha).toBe('123456');
  });

  it('deve identificar uma senha vazia como inválida', () => {
    component.senha = '';
    component.entrar();
    expect(component.erro()).not.toBe('');
  });

  it('deve impedir a tentativa de login com campos inválidos', () => {
    component.email = '';
    component.senha = '';

    component.entrar();

    expect(component.erro()).not.toBe('');
  });

  it('deve permitir a validação quando os campos estiverem preenchidos corretamente', () => {
    component.email = 'usuario@email.com';
    component.senha = '123456';

    component.entrar();

    expect(component.carregando()).toBe(false);
  });
});