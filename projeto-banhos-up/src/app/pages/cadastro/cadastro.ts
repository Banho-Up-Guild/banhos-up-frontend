import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderV2 } from '../../header/header-v2/header-v2';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'app-cadastro',
  imports: [HeaderV2, RouterLink, LucideEye, LucideEyeOff],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css',
})
export class Cadastro {

  mostrarSenha = signal(false);
  mostrarConfirmacaoSenha = signal(false);

  alternarVisibilidadeSenha(): void {
    this.mostrarSenha.update((visivel) => !visivel);
  }

  alternarVisibilidadeConfirmacao(): void {
    this.mostrarConfirmacaoSenha.update((visivel) => !visivel);
  }

}
