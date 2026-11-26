import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Agendamento } from './agendamento';
import { LojaService } from '../../services/loja.service';
import { AgendamentoApiService } from '../../services/agendamento-api.service';
import { PetService } from '../../services/pet.service';
import { ServicoService } from '../../services/servico.service';
import { AuthService } from '../../services/auth.service';

const petsDeTeste = [
  { id: 1, nome: 'Pet 1', especie: 'Cachorro', porte: 'MEDIO', donoId: 42, raca: null, dataNascimento: null, observacoes: null },
  { id: 2, nome: 'Pet 2', especie: 'Gato', porte: 'PEQUENO', donoId: 42, raca: null, dataNascimento: null, observacoes: null },
  { id: 3, nome: 'Pet 3', especie: 'Outro', porte: 'PEQUENO', donoId: 42, raca: null, dataNascimento: null, observacoes: null },
  { id: 4, nome: 'Pet 4', especie: 'Cachorro', porte: 'GRANDE', donoId: 42, raca: null, dataNascimento: null, observacoes: null }
];

describe('Agendamento', () => {
  let component: Agendamento;
  let fixture: ComponentFixture<Agendamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Agendamento],
      providers: [
        {
          provide: LojaService,
          useValue: {
            listarLojas: () => of([]),
            listarFuncionariosPorLoja: () => of([
              { id: 1, nome: 'Ana' },
              { id: 2, nome: 'Bruna' },
              { id: 3, nome: 'Carla' },
              { id: 4, nome: 'Daniela' }
            ])
          }
        },
        {
          provide: AgendamentoApiService,
          useValue: {
            listarDisponibilidade: () => of([]),
            recomendarProfissional: () => of({
              employeeId: 8,
              employeeName: 'Ana'
            }),
            criarAgendamento: () => of({
              dateTimeAppointment: '2026-12-15T10:30:00',
              status: 'AWAITING_CONFIRMATION',
              observation: '',
              totalPrice: 170,
              idEmployee: 8,
              nameEmployee: 'Ana'
            })
          }
        },
        {
          provide: PetService,
          useValue: {
            listarMeusPets: () => of(petsDeTeste),
            listarPorDono: () => of(petsDeTeste),
            cadastrar: (dados: Record<string, unknown>) => of({ id: 5, ...dados }),
            criar: (dados: Record<string, unknown>) => of({
              id: 5,
              ...dados
            })
          }
        },
        {
          provide: ServicoService,
          useValue: {
            listarAtivos: () => of([
              {
                id: 1,
                nome: 'Banho',
                descricao: null,
                preco: 170,
                duracaoMinutos: 90,
                ativo: true
              }
            ])
          }
        },
        {
          provide: AuthService,
          useValue: {
            usuarioAtual: () => ({ id: 42, role: 'CUSTOMER' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Agendamento);
    component = fixture.componentInstance;

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os pets da conta do cliente', () => {
    expect(component.pets.length).toBe(4);
  });

  it('deve apresentar o Pet 3 como Outro', () => {
    const pet = component.pets.find(pet => pet.id === 3);

    expect(pet?.nome).toBe('Pet 3');
    expect(pet?.especie).toBe('Outro');
  });

  it('deve iniciar com o Pet 1 selecionado', () => {
    expect(component.petsSelecionados).toEqual([1]);
  });

  it('deve listar todos os profissionais retornados pela API', () => {
    component.etapa = 3;
    component.selecionarLoja(1);
    fixture.detectChanges();

    const opcoes = fixture.nativeElement.querySelectorAll(
      '.profissional-pet input[name="profissional"]'
    );

    expect(component.profissionais).toHaveLength(4);
    expect(opcoes).toHaveLength(5);
    expect(fixture.nativeElement.textContent).toContain('Daniela');
  });

  it('deve permitir selecionar até três pets', () => {
    component.alternarPet(2);
    component.alternarPet(3);

    expect(component.petsSelecionados).toEqual([1, 2, 3]);
    expect(component.mostrarAvisoLimitePets).toBe(false);
  });

  it('não deve permitir selecionar um quarto pet', () => {
    component.alternarPet(2);
    component.alternarPet(3);
    component.alternarPet(4);

    expect(component.petsSelecionados).toEqual([1, 2, 3]);
    expect(component.mostrarAvisoLimitePets).toBe(true);
  });

  it('deve fechar o aviso ao remover um pet selecionado', () => {
    component.alternarPet(2);
    component.alternarPet(3);
    component.alternarPet(4);

    component.alternarPet(3);

    expect(component.petsSelecionados).toEqual([1, 2]);
    expect(component.mostrarAvisoLimitePets).toBe(false);
  });

  it('deve permitir selecionar novamente um pet após remover outro', () => {
    component.alternarPet(2);
    component.alternarPet(3);
    component.alternarPet(4);

    component.alternarPet(3);
    component.alternarPet(4);

    expect(component.petsSelecionados).toEqual([1, 2, 4]);
    expect(component.mostrarAvisoLimitePets).toBe(false);
  });

  it('não deve cadastrar um novo pet quando três já estiverem selecionados', () => {
    component.alternarPet(2);
    component.alternarPet(3);

    const quantidadePets = component.pets.length;

    component.novoPet.nome = 'Pet Novo';
    component.adicionarPet();

    expect(component.pets.length).toBe(quantidadePets);
    expect(component.petsSelecionados.length).toBe(3);
    expect(component.mostrarAvisoLimitePets).toBe(true);
  });

  it('deve permitir cadastrar um novo pet quando houver espaço na seleção', () => {
    component.novoPet.nome = 'Pet Novo';

    component.adicionarPet();

    expect(component.pets.length).toBe(5);
    expect(component.petsSelecionados.length).toBe(2);
    expect(component.mostrarAvisoLimitePets).toBe(false);
  });
});