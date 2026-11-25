import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideEye,
  LucideEyeOff,
  LucideCircleExclamationPoint
} from '@lucide/angular';
import { HeaderV2 } from '../../header/header-v2/header-v2';

@Component({
  selector: 'app-login',
  imports: [
    HeaderV2,
    FormsModule,
    RouterLink,
    LucideEye,
    LucideEyeOff,
    LucideCircleExclamationPoint
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  mostrarSenha = signal(false);

  emailCpf = '';
  senha = '';

  tentouEntrar = false;

  alternarVisibilidadeSenha(): void {
    this.mostrarSenha.update((visivel) => !visivel);
  }

  formatarIdentificador(valor: string): void {
    // Se houver letras ou @, consideramos que a pessoa está digitando um e-mail.
    if (/[a-zA-Z@]/.test(valor)) {
      this.emailCpf = valor;
      return;
    }

    // Caso contrário, aplicamos a máscara de CPF.
    let numero = valor.replace(/\D/g, '').slice(0, 11);

    numero = numero.replace(/(\d{3})(\d)/, '$1.$2');
    numero = numero.replace(/(\d{3})(\d)/, '$1.$2');
    numero = numero.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    this.emailCpf = numero;
  }

  validarCpf(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
      soma += Number(cpf[i]) * (10 - i);
    }

    let digito = (soma * 10) % 11;

    if (digito === 10) {
      digito = 0;
    }

    if (digito !== Number(cpf[9])) {
      return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
      soma += Number(cpf[i]) * (11 - i);
    }

    digito = (soma * 10) % 11;

    if (digito === 10) {
      digito = 0;
    }

    return digito === Number(cpf[10]);
  }

  get identificadorValido(): boolean {
    const identificador = this.emailCpf.trim();

    if (!identificador) {
      return false;
    }

    // O formato do e-mail será validado futuramente.
    if (identificador.includes('@')) {
      return true;
    }

    return this.validarCpf(identificador);
  }

  get senhaValida(): boolean {
    return this.senha.trim().length > 0;
  }

  get formularioValido(): boolean {
    return this.identificadorValido && this.senhaValida;
  }

  entrar(): void {
    this.tentouEntrar = true;

    if (!this.formularioValido) {
      return;
    }

    // Futuramente: autenticar o usuário com a API.
    console.log('Campos de login válidos.');
  }

}