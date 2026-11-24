import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucidePawPrint,
  LucideShield,
  LucideSquareArrowRightExit,
  LucideChevronRight
} from '@lucide/angular';
import { HeaderV2 } from '../../header/header-v2/header-v2';

@Component({
  selector: 'app-perfil',
  imports: [
    HeaderV2,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    LucidePawPrint,
    LucideShield,
    LucideSquareArrowRightExit,
    LucideChevronRight
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {

  modalSairAberto = signal(false);

  abrirModalSair(): void {
    this.modalSairAberto.set(true);
  }

  fecharModalSair(): void {
    this.modalSairAberto.set(false);
  }

  confirmarSaida(): void {
    this.fecharModalSair();
  }

}
