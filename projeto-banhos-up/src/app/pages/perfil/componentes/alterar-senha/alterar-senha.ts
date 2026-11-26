import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { ClienteService } from '../../../../services/cliente.service';

@Component({
  selector: 'app-alterar-senha',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './alterar-senha.html',
  styleUrl: './alterar-senha.css',
})
export class AlterarSenha {
  private readonly clienteService = inject(ClienteService);

  senhaAtual = '';
  novaSenha = '';
  confirmarNovaSenha = '';

  carregando = signal(false);
  erro = signal('');
  sucesso = signal('');

  salvar(): void {
    this.erro.set('');
    this.sucesso.set('');

    if (!this.senhaAtual || !this.novaSenha || !this.confirmarNovaSenha) {
      this.erro.set('Preencha todos os campos.');
      return;
    }

    if (this.novaSenha.length < 8 || this.novaSenha.length > 72) {
      this.erro.set('A nova senha deve ter entre 8 e 72 caracteres.');
      return;
    }

    const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(this.novaSenha);
    if (!senhaForte) {
      this.erro.set('A nova senha deve conter letra maiúscula, minúscula, número e caractere especial.');
      return;
    }

    if (this.novaSenha !== this.confirmarNovaSenha) {
      this.erro.set('A confirmação não corresponde à nova senha.');
      return;
    }

    if (this.novaSenha === this.senhaAtual) {
      this.erro.set('A nova senha deve ser diferente da senha atual.');
      return;
    }

    this.carregando.set(true);

    this.clienteService.alterarMinhaSenha({
      currentPassword: this.senhaAtual,
      newPassword: this.novaSenha,
    })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: () => {
          this.senhaAtual = '';
          this.novaSenha = '';
          this.confirmarNovaSenha = '';
          this.sucesso.set('Sua senha foi alterada com sucesso.');
        },
        error: (erro) => {
          if (erro?.status === 400 || erro?.status === 401) {
            this.erro.set(erro?.error?.message || 'A senha atual está incorreta ou a nova senha não atende aos requisitos.');
            return;
          }

          if (erro?.status === 0) {
            this.erro.set('Não foi possível conectar ao servidor. Verifique se o Backend está funcionando.');
            return;
          }

          this.erro.set(erro?.error?.message || 'Não foi possível alterar sua senha. Tente novamente.');
        },
      });
  }
}