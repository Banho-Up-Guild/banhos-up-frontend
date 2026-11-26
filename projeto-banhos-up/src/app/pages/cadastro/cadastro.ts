import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { HeaderV2 } from '../../header/header-v2/header-v2';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-cadastro',
  imports: [
    FormsModule,
    RouterLink,
    HeaderV2,
    LucideEye,
    LucideEyeOff
  ],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {

  private readonly clienteService: ClienteService;

  constructor(clienteService: ClienteService) {
    this.clienteService = clienteService;
  }

  // Controle de visibilidade das senhas.
  mostrarSenha = signal(false);
  mostrarConfirmacaoSenha = signal(false);

  // Estados da requisição.
  carregando = signal(false);
  erro = signal('');
  sucesso = signal('');

  // Campos do formulário.
  nome = '';
  cpf = '';
  email = '';
  celular = '';
  telefone = '';
  genero = '';
  nascimento = '';
  senha = '';
  confirmarSenha = '';
  termosAceitos = false;

  alternarVisibilidadeSenha(): void {
    this.mostrarSenha.update((visivel) => !visivel);
  }

  alternarVisibilidadeConfirmacao(): void {
    this.mostrarConfirmacaoSenha.update((visivel) => !visivel);
  }

  cadastrar(): void {

    this.erro.set('');
    this.sucesso.set('');

    if (this.carregando()) {
      return;
    }

    const nome = this.nome.trim();
    const email = this.email.trim().toLowerCase();

    const cpf = this.cpf.replace(/\D/g, '');
    const celular = this.celular.replace(/\D/g, '');
    const telefone = this.telefone.replace(/\D/g, '');

    // Validações do formulário.

    if (!nome) {
      this.erro.set('Informe seu nome completo.');
      return;
    }

    if (!email) {
      this.erro.set('Informe seu e-mail.');
      return;
    }

    if (!this.termosAceitos) {
      this.erro.set('Você precisa aceitar os termos e condições.');
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.erro.set('As senhas não são iguais.');
      return;
    }

    if (this.senha.length < 8 || this.senha.length > 72) {
      this.erro.set('A senha deve possuir entre 8 e 72 caracteres.');
      return;
    }

    const senhaValida =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(
        this.senha
      );

    if (!senhaValida) {
      this.erro.set(
        'A senha precisa conter letra maiúscula, minúscula, número e caractere especial.'
      );
      return;
    }

    if (cpf.length !== 11) {
      this.erro.set('Informe um CPF válido com 11 dígitos.');
      return;
    }

    if (celular.length !== 10 && celular.length !== 11) {
      this.erro.set('Informe um número de celular válido com DDD.');
      return;
    }

    if (telefone && telefone.length !== 10 && telefone.length !== 11) {
      this.erro.set('O telefone opcional informado é inválido.');
      return;
    }

    // Envia os dados para o Backend.
    this.carregando.set(true);

    this.clienteService.cadastrar({
      name: nome,
      email,
      password: this.senha,
      phone: celular,
      cpf,
      secondaryPhone: telefone || null,
      gender: this.genero || null,
      dateOfBirth: this.nascimento || null
    })
    .pipe(
      finalize(() => this.carregando.set(false))
    )
    .subscribe({

      next: () => {

        this.sucesso.set(
          'Cadastro realizado com sucesso! Agora você já pode acessar sua conta.'
        );

        // Limpa os campos após o cadastro.
        this.nome = '';
        this.cpf = '';
        this.email = '';
        this.celular = '';
        this.telefone = '';
        this.genero = '';
        this.nascimento = '';
        this.senha = '';
        this.confirmarSenha = '';
        this.termosAceitos = false;

        this.mostrarSenha.set(false);
        this.mostrarConfirmacaoSenha.set(false);

      },

      error: (erro: HttpErrorResponse) => {

        if (erro.status === 409) {
          this.erro.set(
            'Este e-mail ou CPF já está cadastrado.'
          );
          return;
        }

        if (erro.status === 400) {
          const mensagemBackend = erro.error?.message;

          this.erro.set(
            typeof mensagemBackend === 'string' && mensagemBackend.trim()
              ? mensagemBackend
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