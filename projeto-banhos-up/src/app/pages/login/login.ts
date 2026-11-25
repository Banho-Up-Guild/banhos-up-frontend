import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { HeaderV2 } from '../../header/header-v2/header-v2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    HeaderV2,
    RouterLink,
    FormsModule,
    LucideEye,
    LucideEyeOff
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  mostrarSenha = signal(false);
  carregando = signal(false);
  erro = signal('');

  email = '';
  senha = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  alternarVisibilidadeSenha(): void {
    this.mostrarSenha.update((visivel) => !visivel);
  }

  entrar(): void {
    this.erro.set('');

    const emailDigitado = this.email.trim().toLowerCase();

    if (!emailDigitado || !this.senha) {
      this.erro.set('Preencha o e-mail e a senha.');
      return;
    }

    this.carregando.set(true);

    this.authService.login({
      email: emailDigitado,
      password: this.senha
    })
    .pipe(
      finalize(() => this.carregando.set(false))
    )
    .subscribe({
      next: (resposta) => {

        const perfil = resposta.user.role;

        if (perfil === 'EMPLOYEE' || perfil === 'ADMIN') {
          this.router.navigate(['/funcionario/painel']);
          return;
        }

        if (perfil === 'CUSTOMER') {
          this.router.navigate(['/perfil']);
        }
      },

      error: (erro: HttpErrorResponse) => {

        if (erro.status === 401 || erro.status === 400) {
          this.erro.set('E-mail ou senha inválidos.');
          return;
        }

        if (erro.status === 0) {
          this.erro.set(
            'Não foi possível conectar ao servidor. Verifique se o Backend está funcionando.'
          );
          return;
        }

        this.erro.set(
          'Ocorreu um erro ao realizar o login. Tente novamente.'
        );
      }
    });
  }
}