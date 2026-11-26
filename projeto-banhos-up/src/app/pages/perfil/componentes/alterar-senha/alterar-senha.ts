import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import {
  LucideEye,
  LucideEyeOff,
  LucideCircleExclamationPoint
} from '@lucide/angular';
import { ClienteService } from '../../../../services/cliente.service';

@Component({
  selector: 'app-alterar-senha',
  standalone: true,
  imports: [FormsModule, LucideEye, LucideEyeOff, LucideCircleExclamationPoint],
  templateUrl: './alterar-senha.html',
  styleUrl: './alterar-senha.css',
})
export class AlterarSenha {
  private readonly clienteService = inject(ClienteService);

  mostrarSenhaAtual = signal(false);
  mostrarNovaSenha = signal(false);
  mostrarConfirmacaoSenha = signal(false);
  tentouAlterar = false;
  carregando = signal(false);
  erro = signal('');
  sucesso = signal('');

  senhaAtual = '';
  novaSenha = '';
  confirmarNovaSenha = '';

  alternarSenhaAtual(): void { this.mostrarSenhaAtual.update(v => !v); }
  alternarNovaSenha(): void { this.mostrarNovaSenha.update(v => !v); }
  alternarConfirmacaoSenha(): void { this.mostrarConfirmacaoSenha.update(v => !v); }

  get senhaAtualValida(): boolean { return this.senhaAtual.trim().length > 0; }
  get senhaMinima(): boolean { return this.novaSenha.length >= 8 && this.novaSenha.length <= 72; }
  get senhaMaiuscula(): boolean { return /[A-Z]/.test(this.novaSenha); }
  get senhaMinuscula(): boolean { return /[a-z]/.test(this.novaSenha); }
  get senhaEspecial(): boolean { return /[^A-Za-z0-9]/.test(this.novaSenha); }
  get senhaNumero(): boolean { return /\d/.test(this.novaSenha); }
  get senhaDiferente(): boolean { return this.novaSenha.length > 0 && this.novaSenha !== this.senhaAtual; }

  get novaSenhaValida(): boolean {
    return this.senhaMinima && this.senhaMaiuscula && this.senhaMinuscula &&
      this.senhaEspecial && this.senhaNumero && this.senhaDiferente;
  }

  get confirmacaoValida(): boolean {
    return this.confirmarNovaSenha.length > 0 && this.confirmarNovaSenha === this.novaSenha;
  }

  salvar(): void {
    this.tentouAlterar = true;
    this.erro.set('');
    this.sucesso.set('');

    if (this.carregando()) return;
    if (!this.senhaAtualValida) return this.erro.set('Informe sua senha atual.');
    if (!this.novaSenhaValida) return this.erro.set('A nova senha não atende aos requisitos de segurança ou é igual à senha atual.');
    if (!this.confirmacaoValida) return this.erro.set('A confirmação não corresponde à nova senha.');

    this.carregando.set(true);
    this.clienteService.alterarMinhaSenha({
      currentPassword: this.senhaAtual,
      newPassword: this.novaSenha
    })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: () => {
          this.senhaAtual = '';
          this.novaSenha = '';
          this.confirmarNovaSenha = '';
          this.tentouAlterar = false;
          this.sucesso.set('Sua senha foi alterada com sucesso.');
        },
        error: (erro: HttpErrorResponse) => {
          if (erro.status === 400 || erro.status === 401) {
            this.erro.set(erro.error?.message || 'A senha atual está incorreta ou a nova senha não atende aos requisitos.');
          } else if (erro.status === 0) {
            this.erro.set('Não foi possível conectar ao servidor. Verifique se o Backend está funcionando.');
          } else {
            this.erro.set(erro.error?.message || 'Não foi possível alterar sua senha. Tente novamente.');
          }
        }
      });
  }
}