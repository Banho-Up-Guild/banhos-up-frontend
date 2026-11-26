import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-termos-condicoes',
  standalone: true,
  templateUrl: './termos.html',
  styleUrl: './termos.css'
})
export class TermosCondicoesComponent {

  constructor(private location: Location) {}

  voltar(): void {
    this.location.back();
  }
}
