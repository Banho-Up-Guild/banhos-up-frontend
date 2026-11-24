import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideCircleExclamationPoint } from '@lucide/angular';

interface DadosUsuario {
  nome: string;
  cpf: string;
  email: string;
  genero: string;
  nascimento: string;
  dddCelular: string;
  celular: string;
  dddTelefone: string;
  telefone: string;
}

@Component({
  selector: 'app-meus-dados',
  imports: [
    FormsModule,
    LucideCircleExclamationPoint
  ],
  templateUrl: './meus-dados.html',
  styleUrl: './meus-dados.css'
})
export class MeusDados {

  dados: DadosUsuario = {
    nome: 'User',
    cpf: '529.982.247-25',
    email: 'User@gmail.com',
    genero: 'Feminino',
    nascimento: '15/08/2000',
    dddCelular: '11',
    celular: '99999-9999',
    dddTelefone: '',
    telefone: ''
  };

  tentouSalvar = false;
  salvou = false;

  formatarCpf(valor: string): void {
    let numero = valor.replace(/\D/g, '').slice(0, 11);

    numero = numero.replace(/(\d{3})(\d)/, '$1.$2');
    numero = numero.replace(/(\d{3})(\d)/, '$1.$2');
    numero = numero.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    this.dados.cpf = numero;
    this.salvou = false;
  }

  formatarDdd(valor: string, campo: 'dddCelular' | 'dddTelefone'): void {
    this.dados[campo] = valor.replace(/\D/g, '').slice(0, 2);
    this.salvou = false;
  }

  formatarCelular(valor: string): void {
    let numero = valor.replace(/\D/g, '').slice(0, 9);

    if (numero.length > 5) {
      numero = numero.replace(/(\d{5})(\d)/, '$1-$2');
    }

    this.dados.celular = numero;
    this.salvou = false;
  }

  formatarTelefone(valor: string): void {
    let numero = valor.replace(/\D/g, '').slice(0, 8);

    if (numero.length > 4) {
      numero = numero.replace(/(\d{4})(\d)/, '$1-$2');
    }

    this.dados.telefone = numero;
    this.salvou = false;
  }

  formatarData(valor: string): void {
    let numero = valor.replace(/\D/g, '').slice(0, 8);

    if (numero.length > 4) {
      numero = numero.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
    } else if (numero.length > 2) {
      numero = numero.replace(/(\d{2})(\d+)/, '$1/$2');
    }

    this.dados.nascimento = numero;
    this.salvou = false;
  }

  get nomeValido(): boolean {
    return this.dados.nome.trim().length > 0;
  }

  get cpfValido(): boolean {
    const cpf = this.dados.cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let soma = 0;

    for (let i = 0; i < 9; i++) {
      soma += Number(cpf[i]) * (10 - i);
    }

    let digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;

    if (digito !== Number(cpf[9])) {
      return false;
    }

    soma = 0;

    for (let i = 0; i < 10; i++) {
      soma += Number(cpf[i]) * (11 - i);
    }

    digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;

    return digito === Number(cpf[10]);
  }

  get nascimentoValido(): boolean {
    const data = this.dados.nascimento;

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      return false;
    }

    const [dia, mes, ano] = data.split('/').map(Number);
    const nascimento = new Date(ano, mes - 1, dia);

    return (
      nascimento.getFullYear() === ano &&
      nascimento.getMonth() === mes - 1 &&
      nascimento.getDate() === dia &&
      nascimento <= new Date()
    );
  }

  get dddCelularValido(): boolean {
    return /^\d{2}$/.test(this.dados.dddCelular);
  }

  get celularValido(): boolean {
    return this.dados.celular.replace(/\D/g, '').length === 9;
  }

  get telefoneValido(): boolean {
    const ddd = this.dados.dddTelefone;
    const telefone = this.dados.telefone.replace(/\D/g, '');

    if (!ddd && !telefone) {
      return true;
    }

    return /^\d{2}$/.test(ddd) && telefone.length === 8;
  }

  get formularioValido(): boolean {
    return (
      this.nomeValido &&
      this.cpfValido &&
      this.nascimentoValido &&
      this.dddCelularValido &&
      this.celularValido &&
      this.telefoneValido
    );
  }

  salvar(): void {
    this.tentouSalvar = true;
    this.salvou = false;

    if (!this.formularioValido) {
      return;
    }

    // Simulação de salvamento dos dados.
    this.salvou = true;

    console.log('Dados atualizados:', this.dados);
  }
}
