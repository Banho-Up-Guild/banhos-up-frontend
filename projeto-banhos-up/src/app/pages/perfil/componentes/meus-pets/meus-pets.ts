import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import {
  PetService,
  PetRequest,
  PetResponse,
  PortePet
} from '../../../../services/pet.service';

@Component({
  selector: 'app-meus-pets',
  imports: [FormsModule],
  templateUrl: './meus-pets.html',
  styleUrl: './meus-pets.css'
})
export class MeusPets implements OnInit {

  private readonly petService: PetService;

  constructor(petService: PetService) {
    this.petService = petService;
  }

  pets = signal<PetResponse[]>([]);

  carregando = signal(true);
  salvando = signal(false);
  excluindo = signal(false);

  erro = signal('');
  sucesso = signal('');

  formularioAberto = signal(false);
  petEditandoId = signal<number | null>(null);

  petParaExcluir = signal<number | null>(null);

  // Campos do formulário.
  nome = '';
  especie = 'Cachorro';
  raca = '';
  dataNascimento = '';
  porte: PortePet | '' = '';
  observacoes = '';

  ngOnInit(): void {
    this.carregarPets();
  }

  carregarPets(): void {

    this.carregando.set(true);
    this.erro.set('');

    this.petService.listarMeusPets()
      .pipe(
        finalize(() => this.carregando.set(false))
      )
      .subscribe({

        next: (dados) => {
          this.pets.set(dados || []);
        },

        error: (erro: HttpErrorResponse) => {
          this.erro.set(
            this.mensagemErro(
              erro,
              'Não foi possível carregar seus pets.'
            )
          );
        }

      });
  }

  abrirCadastro(): void {

    this.limparFormulario();

    this.petEditandoId.set(null);
    this.formularioAberto.set(true);

    this.erro.set('');
    this.sucesso.set('');
  }

  editar(pet: PetResponse): void {

    this.limparFormulario();

    this.petEditandoId.set(pet.id);

    this.nome = pet.nome;
    this.especie = pet.especie;
    this.raca = pet.raca || '';
    this.dataNascimento = pet.dataNascimento || '';
    this.porte = pet.porte || '';
    this.observacoes = pet.observacoes || '';

    this.formularioAberto.set(true);

    this.erro.set('');
    this.sucesso.set('');

    this.petParaExcluir.set(null);
  }

  cancelarFormulario(): void {

    this.formularioAberto.set(false);

    this.limparFormulario();

    this.petEditandoId.set(null);

    this.erro.set('');
  }

  salvar(): void {

    this.erro.set('');
    this.sucesso.set('');

    if (this.salvando()) {
      return;
    }

    const nome = this.nome.trim();
    const especie = this.especie.trim();

    if (!nome) {
      this.erro.set('Informe o nome do pet.');
      return;
    }

    if (nome.length > 100) {
      this.erro.set('O nome deve ter no máximo 100 caracteres.');
      return;
    }

    if (!especie) {
      this.erro.set('Selecione a espécie do pet.');
      return;
    }

    if (especie.length > 50) {
      this.erro.set('A espécie deve ter no máximo 50 caracteres.');
      return;
    }

    if (this.raca.trim().length > 80) {
      this.erro.set('A raça deve ter no máximo 80 caracteres.');
      return;
    }

    if (this.observacoes.trim().length > 500) {
      this.erro.set('As observações devem ter no máximo 500 caracteres.');
      return;
    }

    const dados: PetRequest = {

      nome,
      especie,
      raca: this.raca.trim() || null,
      dataNascimento: this.dataNascimento || null,
      porte: this.porte || null,
      observacoes: this.observacoes.trim() || null

    };

    this.salvando.set(true);

    const id = this.petEditandoId();

    const requisicao = id !== null
      ? this.petService.atualizar(id, dados)
      : this.petService.cadastrar(dados);

    requisicao
      .pipe(
        finalize(() => this.salvando.set(false))
      )
      .subscribe({

        next: (petSalvo) => {

          if (id !== null) {

            this.pets.update(lista =>
              lista.map(pet =>
                pet.id === petSalvo.id ? petSalvo : pet
              )
            );

            this.sucesso.set(
              'Os dados do pet foram atualizados com sucesso.'
            );

          } else {

            this.pets.update(lista => [
              ...lista,
              petSalvo
            ]);

            this.sucesso.set(
              'Pet cadastrado com sucesso!'
            );

          }

          this.cancelarFormulario();

        },

        error: (erro: HttpErrorResponse) => {

          this.erro.set(
            this.mensagemErro(
              erro,
              'Não foi possível salvar os dados do pet.'
            )
          );

        }

      });
  }

  solicitarExclusao(id: number): void {

    this.petParaExcluir.set(id);

    this.erro.set('');
    this.sucesso.set('');

    this.formularioAberto.set(false);
  }

  cancelarExclusao(): void {
    this.petParaExcluir.set(null);
  }

  confirmarExclusao(): void {

    const id = this.petParaExcluir();

    if (id === null || this.excluindo()) {
      return;
    }

    this.excluindo.set(true);

    this.erro.set('');
    this.sucesso.set('');

    this.petService.excluir(id)
      .pipe(
        finalize(() => this.excluindo.set(false))
      )
      .subscribe({

        next: () => {

          this.pets.update(lista =>
            lista.filter(pet => pet.id !== id)
          );

          this.petParaExcluir.set(null);

          this.sucesso.set(
            'Pet excluído com sucesso.'
          );

        },

        error: (erro: HttpErrorResponse) => {

          this.erro.set(
            this.mensagemErro(
              erro,
              'Não foi possível excluir este pet.'
            )
          );

          this.petParaExcluir.set(null);
        }

      });
  }

  porteDescricao(porte: PortePet | null): string {

    switch (porte) {
      case 'PEQUENO':
        return 'Pequeno';

      case 'MEDIO':
        return 'Médio';

      case 'GRANDE':
        return 'Grande';

      default:
        return 'Não informado';
    }
  }

  formatarData(data: string | null): string {

    if (!data) {
      return 'Não informada';
    }

    const partes = data.split('-');

    if (partes.length !== 3) {
      return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  private limparFormulario(): void {

    this.nome = '';
    this.especie = 'Cachorro';
    this.raca = '';
    this.dataNascimento = '';
    this.porte = '';
    this.observacoes = '';

  }

  private mensagemErro(
    erro: HttpErrorResponse,
    padrao: string
  ): string {

    if (erro.status === 0) {
      return 'Não foi possível conectar ao servidor.';
    }

    if (erro.status === 401) {
      return 'Sua sessão expirou. Entre novamente na sua conta.';
    }

    if (erro.status === 403) {
      return 'Você não tem permissão para realizar esta operação.';
    }

    if (erro.status === 404) {
      return 'O pet informado não foi encontrado.';
    }

    if (erro.status === 409) {
      return erro.error?.message ||
        'Este pet possui histórico de agendamentos e não pode ser excluído.';
    }

    const mensagem = erro.error?.message;

    if (typeof mensagem === 'string' && mensagem.trim()) {
      return mensagem;
    }

    return padrao;
  }
}
