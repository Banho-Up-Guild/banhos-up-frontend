import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { HeaderV2 } from '../../header/header-v2/header-v2';

import {
  LucideCircleExclamationPoint,
  LucideEye,
  LucideEyeOff
} from '@lucide/angular';

import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    HeaderV2,
    LucideEye,
    LucideEyeOff,
    LucideCircleExclamationPoint
  ],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {

  private readonly clienteService: ClienteService;

  constructor(clienteService: ClienteService) {
    this.clienteService = clienteService;
  }

  // =========================================
  // CONTROLE DE VISIBILIDADE DAS SENHAS
  // =========================================

  mostrarSenha = signal(false);

  mostrarConfirmacaoSenha = signal(false);

  alternarVisibilidadeSenha(): void {
    this.mostrarSenha.update(valor => !valor);
  }

  alternarVisibilidadeConfirmacao(): void {
    this.mostrarConfirmacaoSenha.update(valor => !valor);
  }

  // =========================================
  // ESTADOS DO CADASTRO
  // =========================================

  carregando = signal(false);

  erro = signal('');

  sucesso = signal('');

  tentouCadastrar = false;

  // =========================================
  // CAMPOS DO FORMULÁRIO
  // =========================================

  nome = '';

  cpf = '';

  email = '';

  celular = '';

  genero = '';

  nascimento = '';

  senha = '';

  confirmarSenha = '';

  termosAceitos = false;

  // =========================================
  // VALIDAÇÃO DO NOME
  // =========================================

  get nomeValido(): boolean {

    return this.nome.trim().length >= 3;

  }

  // =========================================
  // FORMATAÇÃO E VALIDAÇÃO DO CPF
  // =========================================

  formatarCpf(valor: string): void {

    const numeros = (valor || '')
      .replace(/\D/g, '')
      .slice(0, 11);

    if (numeros.length <= 3) {

      this.cpf = numeros;

    } else if (numeros.length <= 6) {

      this.cpf = numeros.replace(
        /^(\d{3})(\d+)/,
        '$1.$2'
      );

    } else if (numeros.length <= 9) {

      this.cpf = numeros.replace(
        /^(\d{3})(\d{3})(\d+)/,
        '$1.$2.$3'
      );

    } else {

      this.cpf = numeros.replace(
        /^(\d{3})(\d{3})(\d{3})(\d{1,2})/,
        '$1.$2.$3-$4'
      );

    }

  }

  get cpfValido(): boolean {

    const cpf = this.cpf.replace(/\D/g, '');

    if (cpf.length !== 11) {
      return false;
    }

    // CPF com todos os números iguais é inválido.
    if (/^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    const calcularDigito = (base: string, pesoInicial: number): number => {

      let soma = 0;

      for (let i = 0; i < base.length; i++) {

        soma += Number(base[i]) * (pesoInicial - i);

      }

      const resto = (soma * 10) % 11;

      return resto === 10 ? 0 : resto;

    };

    const primeiroDigito = calcularDigito(
      cpf.substring(0, 9),
      10
    );

    if (primeiroDigito !== Number(cpf[9])) {
      return false;
    }

    const segundoDigito = calcularDigito(
      cpf.substring(0, 10),
      11
    );

    return segundoDigito === Number(cpf[10]);

  }

  // =========================================
  // VALIDAÇÃO DO E-MAIL
  // =========================================

  get emailValido(): boolean {

    const email = this.email.trim();

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return regex.test(email);

  }

  // =========================================
  // FORMATAÇÃO E VALIDAÇÃO DO CELULAR
  // =========================================

  formatarCelular(valor: string): void {

    const numeros = (valor || '')
      .replace(/\D/g, '')
      .slice(0, 11);

    if (numeros.length === 0) {

      this.celular = '';

      return;

    }

    if (numeros.length <= 2) {

      this.celular = `(${numeros}`;

    } else if (numeros.length <= 10) {

      this.celular = numeros.replace(
        /^(\d{2})(\d{0,4})(\d{0,4})$/,
        (_, ddd, parte1, parte2) => {

          return parte2
            ? `(${ddd}) ${parte1}-${parte2}`
            : `(${ddd}) ${parte1}`;

        }
      );

    } else {

      this.celular = numeros.replace(
        /^(\d{2})(\d{5})(\d{0,4})$/,
        '($1) $2-$3'
      );

    }

  }

  get celularValido(): boolean {

    const celular = this.celular.replace(/\D/g, '');

    return celular.length === 10 || celular.length === 11;

  }

  // =========================================
  // VALIDAÇÃO DA DATA DE NASCIMENTO
  // =========================================

  get nascimentoValido(): boolean {

    // A data é opcional.
    if (!this.nascimento) {
      return true;
    }

    const data = new Date(
      `${this.nascimento}T00:00:00`
    );

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    return Number.isFinite(data.getTime()) && data < hoje;

  }

  // =========================================
  // VALIDAÇÃO DA SENHA
  // =========================================

  get senhaMinima(): boolean {

    return this.senha.length >= 8 &&
      this.senha.length <= 72;

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

    return this.senhaMinima &&
      this.senhaMaiuscula &&
      this.senhaMinuscula &&
      this.senhaEspecial &&
      this.senhaNumero;

  }

  // =========================================
  // CONFIRMAÇÃO DA SENHA
  // =========================================

  get confirmacaoValida(): boolean {

    return this.confirmarSenha.length > 0 &&
      this.confirmarSenha === this.senha;

  }

  // =========================================
  // CADASTRO DO CLIENTE
  // =========================================

  cadastrar(): void {

    this.tentouCadastrar = true;

    this.erro.set('');

    this.sucesso.set('');

    if (this.carregando()) {
      return;
    }

    // Verifica os dados antes de enviar ao Backend.

    if (!this.nomeValido) {

      this.erro.set('Informe seu nome completo.');

      return;

    }

    if (!this.cpfValido) {

      this.erro.set('Informe um CPF válido.');

      return;

    }

    if (!this.emailValido) {

      this.erro.set('Informe um e-mail válido.');

      return;

    }

    if (!this.celularValido) {

      this.erro.set('Informe um celular válido com DDD.');

      return;

    }

    if (!this.nascimentoValido) {

      this.erro.set('Informe uma data de nascimento válida.');

      return;

    }

    if (!this.senhaValida) {

      this.erro.set(
        'A senha não atende aos requisitos de segurança.'
      );

      return;

    }

    if (!this.confirmacaoValida) {

      this.erro.set('As senhas não coincidem.');

      return;

    }

    if (!this.termosAceitos) {

      this.erro.set(
        'Você precisa aceitar os termos e condições.'
      );

      return;

    }

    // =========================================
    // NORMALIZAÇÃO DOS DADOS
    // =========================================

    const dados = {

      name: this.nome.trim(),

      email: this.email.trim().toLowerCase(),

      password: this.senha,

      phone: this.celular.replace(/\D/g, ''),

      cpf: this.cpf.replace(/\D/g, ''),

      gender: this.genero || null,

      dateOfBirth: this.nascimento || null

    };

    // =========================================
    // ENVIO PARA O BACKEND
    // =========================================

    this.carregando.set(true);

    this.clienteService.cadastrar(dados)

      .pipe(
        finalize(() => this.carregando.set(false))
      )

      .subscribe({

        next: () => {

          this.sucesso.set(
            'Cadastro realizado com sucesso! Agora você já pode acessar sua conta.'
          );

          // Limpa os dados do formulário.
          this.nome = '';

          this.cpf = '';

          this.email = '';

          this.celular = '';

          this.genero = '';

          this.nascimento = '';

          this.senha = '';

          this.confirmarSenha = '';

          this.termosAceitos = false;

          this.tentouCadastrar = false;

          this.mostrarSenha.set(false);

          this.mostrarConfirmacaoSenha.set(false);

        },

        error: (erro: HttpErrorResponse) => {

          console.error(
            'Erro ao cadastrar cliente:',
            erro
          );

          if (erro.status === 409) {

            this.erro.set(
              'Este CPF ou e-mail já está cadastrado.'
            );

            return;

          }

          if (erro.status === 400) {

            const mensagem = erro.error?.message;

            this.erro.set(
              typeof mensagem === 'string' && mensagem.trim()
                ? mensagem
                : 'Alguns dados são inválidos. Confira as informações preenchidas.'
            );

            return;

          }

          if (erro.status === 0) {

            this.erro.set(
              'Não foi possível conectar ao servidor. Verifique se o Backend está funcionando.'
            );

            return;

          }

          this.erro.set(
            'Ocorreu um erro ao realizar o cadastro. Tente novamente.'
          );

        }

      });

  }

}