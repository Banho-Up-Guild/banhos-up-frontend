import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Agendamento } from './agendamento';
import { LojaService } from '../../services/loja.service';
import { AgendamentoApiService } from '../../services/agendamento-api.service';

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
            listarLojas: () => of([])
          }
        },
        {
          provide: AgendamentoApiService,
          useValue: {
            listarCalendario: () => of([])
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

  it('deve apresentar quatro pets de exemplo', () => {
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