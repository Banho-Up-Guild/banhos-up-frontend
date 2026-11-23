import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideEye, LucideEyeOff } from '@lucide/angular';
import { HeaderV2 } from '../../header/header-v2/header-v2';

@Component({
  selector: 'app-login',
  imports: [HeaderV2, RouterLink, LucideEye, LucideEyeOff],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  mostrarSenha = signal(false);

  alternarVisibilidadeSenha(): void {
    this.mostrarSenha.update((visivel) => !visivel);
  }

}