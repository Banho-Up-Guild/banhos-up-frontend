import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HeaderV2 } from '../../header/header-v2/header-v2';
import {
  LucideEye,
  LucideEyeOff,
  LucideCircleExclamationPoint
} from '@lucide/angular';

@Component({
  selector: 'app-cadastro',
  imports: [
    HeaderV2,
    FormsModule,
    RouterLink,
    LucideEye,
    LucideEyeOff,
    LucideCircleExclamationPoint
  ],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {

  mostrarSenha = signal(false);
  mostrarConfirmacaoSenha = signal(false);

  nome = '';
  cpf = '';
  email = '';
  celular = '';
  telefone = '';
  genero = '';
  nascimento = '';
  senha = '';
  confirmarSenha = '';
  termos = false;

  tentouCadastrar = false;

  alternarVisibilidadeSenha(): void {
    this.mostrarSenha.update((visivel) => !visivel);
  }

  alternarVisibilidadeConfirmacao(): void {
    this.mostrarConfirmacaoSenha.update((visivel) => !visivel);
  }

  formatarCpf(valor: string): void {
    let numero = valor.replace(/\D/g, '').slice(0, 11);

    numero = numero.replace(/(\d{3})(\d)/, '$1.$2');
    numero = numero.replace(/(\d{3})(\d)/, '$1.$2');
    numero = numero.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    this.cpf = numero;
  }
  
  formatarCelular(valor: string): void {
    const numero = valor.replace(/\D/g, '').slice(0, 11);

    if (numero.length <= 2) {
      this.celular = numero;
    } else if (numero.length <= 7) {
      this.celular = `(${numero.slice(0, 2)}) ${numero.slice(2)}`;
    } else {
      this.celular = `(${numero.slice(0, 2)}) ${numero.slice(2, 7)}-${numero.slice(7)}`;
    }
  }

  formatarTelefone(valor: string): void {
    const numero = valor.replace(/\D/g, '').slice(0, 10);

    if (numero.length <= 2) {
      this.telefone = numero;
    } else if (numero.length <= 6) {
      this.telefone = `(${numero.slice(0, 2)}) ${numero.slice(2)}`;
    } else {
      this.telefone = `(${numero.slice(0, 2)}) ${numero.slice(2, 6)}-${numero.slice(6)}`;
    }
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

  get nomeValido(): boolean {
    const nome = this.nome.trim();

    return nome.length > 0 && nome.length <= 100;
  }

  get cpfValido(): boolean {
    return this.validarCpf(this.cpf);
  }

  get emailValido(): boolean {
    return this.email.trim().length > 0;
  }

  get celularValido(): boolean {
    return this.celular.replace(/\D/g, '').length === 11;
  }

  get telefoneValido(): boolean {
    const numero = this.telefone.replace(/\D/g, '');

    return numero.length === 0 || numero.length === 10;
  }

  get nascimentoValido(): boolean {
    if (!this.nascimento) {
      return false;
    }

    const partes = this.nascimento.split('-').map(Number);

    if (partes.length !== 3) {
      return false;
    }

    const [ano, mes, dia] = partes;

    const dataNascimento = new Date(ano, mes - 1, dia);

    // Verifica se a data realmente existe.
    if (
      dataNascimento.getFullYear() !== ano ||
      dataNascimento.getMonth() !== mes - 1 ||
      dataNascimento.getDate() !== dia
    ) {
      return false;
    }

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const dataLimite = new Date(
      hoje.getFullYear() - 18,
      hoje.getMonth(),
      hoje.getDate()
    );

    // A pessoa precisa ter completado 18 anos.
    return dataNascimento <= dataLimite;
  }

  get senhaMinima(): boolean {
    return this.senha.length >= 8;
  }

  get senhaMaiuscula(): boolean {
    return /[A-Z]/.test(this.senha);
  }

  get senhaMinuscula(): boolean {
    return /[a-z]/.test(this.senha);
  }

  get senhaEspecial(): boolean {
    return /[^A-Za-z0-9]/.test(this.senha);
  }

  get senhaNumero(): boolean {
    return /\d/.test(this.senha);
  }

  get senhaValida(): boolean {
    return (
      this.senhaMinima &&
      this.senhaMaiuscula &&
      this.senhaMinuscula &&
      this.senhaEspecial &&
      this.senhaNumero
    );
  }

  get confirmacaoValida(): boolean {
    return this.confirmarSenha.length > 0 &&
      this.confirmarSenha === this.senha;
  }

  get formularioValido(): boolean {
    return (
      this.nomeValido &&
      this.cpfValido &&
      this.emailValido &&
      this.celularValido &&
      this.telefoneValido &&
      this.nascimentoValido &&
      this.senhaValida &&
      this.confirmacaoValida &&
      this.termos
    );
  }

  cadastrar(): void {
    this.tentouCadastrar = true;

    if (!this.formularioValido) {
      return;
    }

    // Futuramente: enviar os dados para a API.
    console.log('Cadastro preenchido corretamente.');
  }

}