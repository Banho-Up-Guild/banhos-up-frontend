import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideCircleExclamationPoint } from '@lucide/angular';

interface Pet {
  id: number;
  nome: string;
  tipo: string;
  raca: string;
  cor: string;
  dataNascimento: string;
  nascimentoDesconhecido: boolean;
}

type ModalTipo = 'cadastro' | 'edicao' | 'remocao' | null;

@Component({
  selector: 'app-meus-pets',
  standalone: true,
  imports: [FormsModule, LucideCircleExclamationPoint],
  templateUrl: './meus-pets.html',
  styleUrl: './meus-pets.css'
})
export class MeusPets {
  pets = signal<Pet[]>([]);

  modalAberto = signal<ModalTipo>(null);

  nome = '';
  tipo = '';
  raca = '';
  cor = '';
  dataNascimento = '';
  nascimentoDesconhecido = false;

  tentouSalvar = false;

  petEmEdicao: number | null = null;
  petParaRemover: number | null = null;

  private proximoId = 1;

  abrirModalCadastro(): void {
    this.limparFormulario();
    this.modalAberto.set('cadastro');
  }

  abrirModalEdicao(pet: Pet): void {
    this.nome = pet.nome;
    this.tipo = pet.tipo;
    this.raca = pet.raca;
    this.cor = pet.cor;
    this.dataNascimento = pet.dataNascimento;
    this.nascimentoDesconhecido = pet.nascimentoDesconhecido;

    this.petEmEdicao = pet.id;
    this.tentouSalvar = false;

    this.modalAberto.set('edicao');
  }

  abrirModalRemocao(pet: Pet): void {
    this.petParaRemover = pet.id;
    this.modalAberto.set('remocao');
  }

  fecharModal(): void {
    this.modalAberto.set(null);
    this.petEmEdicao = null;
    this.petParaRemover = null;
    this.limparFormulario();
  }

  limparFormulario(): void {
    this.nome = '';
    this.tipo = '';
    this.raca = '';
    this.cor = '';
    this.dataNascimento = '';
    this.nascimentoDesconhecido = false;
    this.tentouSalvar = false;
    this.petEmEdicao = null;
  }

  alterarNascimentoDesconhecido(): void {
    if (this.nascimentoDesconhecido) {
      this.dataNascimento = '';
    }
  }

  get nomeValido(): boolean {
    return this.nome.trim().length > 0;
  }

  get tipoValido(): boolean {
    return this.tipo.trim().length > 0;
  }

  get racaValida(): boolean {
    return this.raca.trim().length > 0;
  }

  get corValida(): boolean {
    return this.cor.trim().length > 0;
  }

  get dataNascimentoValida(): boolean {
    if (this.nascimentoDesconhecido) {
      return true;
    }

    if (!this.dataNascimento) {
      return false;
    }

    const [ano, mes, dia] = this.dataNascimento.split('-').map(Number);

    const data = new Date(ano, mes - 1, dia);
    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const dataValida =
      data.getFullYear() === ano &&
      data.getMonth() === mes - 1 &&
      data.getDate() === dia;

    return dataValida && data <= hoje;
  }

  get formularioValido(): boolean {
    return (
      this.nomeValido &&
      this.tipoValido &&
      this.racaValida &&
      this.corValida &&
      this.dataNascimentoValida
    );
  }

  salvarPet(): void {
    this.tentouSalvar = true;

    if (!this.formularioValido) {
      return;
    }

    const dadosPet: Pet = {
      id: this.petEmEdicao ?? this.proximoId++,
      nome: this.nome.trim(),
      tipo: this.tipo,
      raca: this.raca.trim(),
      cor: this.cor.trim(),
      dataNascimento: this.nascimentoDesconhecido
        ? ''
        : this.dataNascimento,
      nascimentoDesconhecido: this.nascimentoDesconhecido
    };

    if (this.modalAberto() === 'edicao') {
      this.pets.update(pets =>
        pets.map(pet =>
          pet.id === this.petEmEdicao ? dadosPet : pet
        )
      );
    } else {
      this.pets.update(pets => [...pets, dadosPet]);
    }

    this.fecharModal();
  }

  confirmarRemocao(): void {
    if (this.petParaRemover === null) {
      return;
    }

    this.pets.update(pets =>
      pets.filter(pet => pet.id !== this.petParaRemover)
    );

    this.fecharModal();
  }

  formatarData(data: string): string {
    if (!data) {
      return 'Não informada';
    }

    const [ano, mes, dia] = data.split('-');

    return `${dia}/${mes}/${ano}`;
  }
}
