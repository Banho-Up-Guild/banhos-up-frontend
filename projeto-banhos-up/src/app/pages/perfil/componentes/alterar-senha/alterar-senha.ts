import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideEye,
  LucideEyeOff,
  LucideCircleExclamationPoint
} from '@lucide/angular';

@Component({
  selector: 'app-alterar-senha',
  imports: [
    FormsModule,
    LucideEye,
    LucideEyeOff,
    LucideCircleExclamationPoint
  ],
  templateUrl: './alterar-senha.html',
  styleUrl: './alterar-senha.css',
})
export class AlterarSenha {

  mostrarSenhaAtual = signal(false);
  mostrarNovaSenha = signal(false);
  mostrarConfirmacaoSenha = signal(false);

  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';

  tentouAlterar = false;

  // Senha fictícia para os testes iniciais.
  private readonly senhaCadastradaMock = 'Banhos@123';

  alternarSenhaAtual(): void {
    this.mostrarSenhaAtual.update((visivel) => !visivel);
  }

  alternarNovaSenha(): void {
    this.mostrarNovaSenha.update((visivel) => !visivel);
  }

  alternarConfirmacaoSenha(): void {
    this.mostrarConfirmacaoSenha.update((visivel) => !visivel);
  }

  get senhaAtualValida(): boolean {
    return (
      this.senhaAtual.length > 0 &&
      this.senhaAtual === this.senhaCadastradaMock
    );
  }

  get senhaMinima(): boolean {
    return this.novaSenha.length >= 8;
  }

  get senhaMaiuscula(): boolean {
    return /[A-Z]/.test(this.novaSenha);
  }

  get senhaMinuscula(): boolean {
    return /[a-z]/.test(this.novaSenha);
  }

  get senhaEspecial(): boolean {
    return /[^A-Za-z0-9]/.test(this.novaSenha);
  }

  get senhaNumero(): boolean {
    return /\d/.test(this.novaSenha);
  }

  get novaSenhaValida(): boolean {
    return (
      this.senhaMinima &&
      this.senhaMaiuscula &&
      this.senhaMinuscula &&
      this.senhaEspecial &&
      this.senhaNumero &&
      this.novaSenha !== this.senhaAtual
    );
  }

  get senhaDiferente(): boolean {
    return (
      this.novaSenha.length > 0 &&
      this.novaSenha !== this.senhaAtual
    );
  }

  get confirmacaoValida(): boolean {
    return (
      this.confirmarSenha.length > 0 &&
      this.confirmarSenha === this.novaSenha
    );
  }

  get formularioValido(): boolean {
    return (
      this.senhaAtualValida &&
      this.novaSenhaValida &&
      this.confirmacaoValida
    );
  }

  alterarSenha(): void {
    this.tentouAlterar = true;

    if (!this.formularioValido) {
      return;
    }

    // Futuramente: enviar a alteração para a API.
    console.log('Senha alterada com sucesso.');

    this.senhaAtual = '';
    this.novaSenha = '';
    this.confirmarSenha = '';
    this.tentouAlterar = false;
  }

}
