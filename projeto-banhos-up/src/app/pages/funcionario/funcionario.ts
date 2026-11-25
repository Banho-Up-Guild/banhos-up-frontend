import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from '../../services/auth.service';

type ModuloFuncionario =
  | 'painel'
  | 'agendamentos'
  | 'disponibilidade'
  | 'solicitacoes'
  | 'servicos'
  | 'equipe'
  | 'unidade';

@Component({
  selector: 'app-funcionario',
  imports: [RouterLink],
  templateUrl: './funcionario.html',
  styleUrl: './funcionario.css',
})
export class Funcionario {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly usuarioAtual = this.authService.usuarioAtual;

  readonly modulo = signal<ModuloFuncionario>('painel');

  readonly menu = [
    {
      path: 'painel' as ModuloFuncionario,
      titulo: 'Painel inicial',
      icone: '⌂'
    },
    {
      path: 'agendamentos' as ModuloFuncionario,
      titulo: 'Agendamentos',
      icone: '▦'
    },
    {
      path: 'disponibilidade' as ModuloFuncionario,
      titulo: 'Disponibilidade e horários',
      icone: '◷'
    },
    {
      path: 'solicitacoes' as ModuloFuncionario,
      titulo: 'Solicitações',
      icone: '▤'
    },
    {
      path: 'servicos' as ModuloFuncionario,
      titulo: 'Serviços e preços',
      icone: '◇'
    },
    {
      path: 'equipe' as ModuloFuncionario,
      titulo: 'Gerir equipe das unidades',
      icone: '♧'
    },
    {
      path: 'unidade' as ModuloFuncionario,
      titulo: 'Gerenciar unidade',
      icone: '⌖'
    }
  ];

  private readonly textos: Record<
    ModuloFuncionario,
    { titulo: string; descricao: string }
  > = {
    painel: {
      titulo: 'Painel inicial',
      descricao: 'Acompanhe as informações gerais da sua unidade.'
    },
    agendamentos: {
      titulo: 'Agendamentos',
      descricao: 'Consulte e acompanhe os agendamentos da sua unidade.'
    },
    disponibilidade: {
      titulo: 'Disponibilidade e horários',
      descricao: 'Configure os dias e horários de funcionamento e atendimento.'
    },
    solicitacoes: {
      titulo: 'Solicitações de agendamento',
      descricao: 'Receba, consulte e responda às solicitações dos clientes.'
    },
    servicos: {
      titulo: 'Serviços e preços',
      descricao: 'Gerencie o catálogo de serviços e seus preços globais.'
    },
    equipe: {
      titulo: 'Gerir equipe das unidades',
      descricao: 'Gerencie os membros vinculados à sua unidade.'
    },
    unidade: {
      titulo: 'Gerenciar unidade',
      descricao: 'Consulte e atualize as informações da sua unidade.'
    }
  };

  readonly tituloAtual = computed(
    () => this.textos[this.modulo()].titulo
  );

  readonly descricaoAtual = computed(
    () => this.textos[this.modulo()].descricao
  );

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((parametros) => {

        const modulo = parametros.get('modulo');

        const moduloValido = this.menu.some(
          (item) => item.path === modulo
        );

        if (moduloValido) {
          this.modulo.set(modulo as ModuloFuncionario);
        } else {
          this.router.navigate(
            ['/funcionario/painel'],
            { replaceUrl: true }
          );
        }
      });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}