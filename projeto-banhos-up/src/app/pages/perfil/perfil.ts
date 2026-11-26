import { Component, inject, signal } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { HeaderV2 } from '../../header/header-v2/header-v2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,

  imports: [
    HeaderV2,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],

  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {

  readonly authService = inject(AuthService);

  private readonly router = inject(Router);

  modalSairAberto = signal(false);

  abrirModalSair(): void {
    this.modalSairAberto.set(true);
  }

  fecharModalSair(): void {
    this.modalSairAberto.set(false);
  }

  confirmarSaida(): void {

    this.authService.logout();

    this.fecharModalSair();

    this.router.navigateByUrl('/');
  }

}