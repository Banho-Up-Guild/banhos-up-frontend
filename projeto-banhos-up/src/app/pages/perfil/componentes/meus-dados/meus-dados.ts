import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import {
  AtualizarPerfilClienteRequest,
  ClienteService,
  PerfilClienteResponse
} from '../../../../services/cliente.service';

@Component({
  selector: 'app-meus-dados',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './meus-dados.html',
  styleUrl: './meus-dados.css'
})
export class MeusDados implements OnInit {
  carregando = signal(true);
  salvando = signal(false);
  erro = signal('');
  sucesso = signal('');
  perfil = signal<PerfilClienteResponse | null>(null);

  nome = '';
  dddCelular = '';
  celularLocal = '';
  telefoneSecundario = '';
  genero = '';
  dataNascimento = '';
  endereco = '';

  constructor(private readonly clienteService: ClienteService) {}

  ngOnInit(): void { this.carregarPerfil(); }

  carregarPerfil(): void {
    this.erro.set('');
    this.sucesso.set('');
    this.carregando.set(true);

    this.clienteService.buscarMeuPerfil()
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: perfil => {
          this.perfil.set(perfil);
          this.preencherFormulario(perfil);
        },
        error: (erro: HttpErrorResponse) => {
          this.erro.set(this.mensagemErro(erro, 'Não foi possível carregar seus dados.'));
        }
      });
  }

  salvar(): void {
    this.erro.set('');
    this.sucesso.set('');
    if (this.salvando()) return;

    const nome = this.nome.trim();
    const celular = `${this.dddCelular.replace(/\D/g, '')}${this.celularLocal.replace(/\D/g, '')}`;
    const telefone = this.telefoneSecundario.replace(/\D/g, '');

    if (!nome) return this.erro.set('Informe seu nome completo.');
    if (this.dddCelular.replace(/\D/g, '').length !== 2 ||
        (celular.length !== 10 && celular.length !== 11)) {
      return this.erro.set('Informe um celular válido com DDD.');
    }
    if (telefone && telefone.length !== 10 && telefone.length !== 11) {
      return this.erro.set('Informe um telefone secundário válido com DDD.');
    }

    const dados: AtualizarPerfilClienteRequest = {
      name: nome,
      phone: celular,
      secondaryPhone: telefone || null,
      gender: this.genero || null,
      dateOfBirth: this.dataNascimento || null,
      address: this.endereco.trim() || null
    };

    this.salvando.set(true);
    this.clienteService.atualizarMeuPerfil(dados)
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: perfilAtualizado => {
          this.perfil.set(perfilAtualizado);
          this.preencherFormulario(perfilAtualizado);
          this.sucesso.set('Seus dados foram atualizados com sucesso.');
        },
        error: (erro: HttpErrorResponse) => {
          this.erro.set(this.mensagemErro(erro, 'Não foi possível atualizar seus dados.'));
        }
      });
  }

  restaurarDados(): void {
    const perfilAtual = this.perfil();
    if (!perfilAtual) return;
    this.preencherFormulario(perfilAtual);
    this.erro.set('');
    this.sucesso.set('Alterações descartadas.');
  }

  private preencherFormulario(perfil: PerfilClienteResponse): void {
    this.nome = perfil.name ?? '';
    const celular = (perfil.phone ?? '').replace(/\D/g, '');
    this.dddCelular = celular.slice(0, 2);
    this.celularLocal = celular.slice(2);
    this.telefoneSecundario = perfil.secondaryPhone ?? '';
    this.genero = perfil.gender ?? '';
    this.dataNascimento = perfil.dateOfBirth ?? '';
    this.endereco = perfil.address ?? '';
  }

  private mensagemErro(erro: HttpErrorResponse, padrao: string): string {
    if (erro.status === 0) return 'Não foi possível conectar ao servidor. Verifique se o Backend está funcionando.';
    if (erro.status === 401) return 'Sua sessão expirou. Entre novamente na sua conta.';
    if (erro.status === 403) return 'Você não tem permissão para acessar estes dados.';
    const corpo = erro.error;
    if (typeof corpo?.message === 'string' && corpo.message.trim()) return corpo.message;
    if (corpo?.errors && typeof corpo.errors === 'object') return Object.values(corpo.errors).join(' ');
    return padrao;
  }
}