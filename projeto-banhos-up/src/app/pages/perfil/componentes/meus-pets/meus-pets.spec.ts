import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MeusPets } from './meus-pets';
import { PetService, PetResponse } from '../../../../services/pet.service';

describe('MeusPets', () => {
  let component: MeusPets;
  let fixture: ComponentFixture<MeusPets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusPets],
      providers: [{
        provide: PetService,
        useValue: {
          listarMeusPets: () => of([]),
          cadastrar: (dados: Record<string, unknown>) => of({ id: 1, ...dados } as PetResponse),
          atualizar: (id: number, dados: Record<string, unknown>) => of({ id, ...dados } as PetResponse),
          excluir: () => of(undefined)
        }
      }]
    }).compileComponents();

    fixture = TestBed.createComponent(MeusPets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function preencherFormulario(): void {
    component.nome = 'Bob';
    component.especie = 'Cachorro';
    component.raca = 'Golden Retriever';
    component.dataNascimento = '2020-01-01';
    component.porte = 'MEDIO';
  }

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar sem nenhum pet cadastrado', () => {
    expect(component.pets().length).toBe(0);
  });

  it('deve abrir o modal de cadastro', () => {
    component.abrirCadastro();

    expect(component.formularioAberto()).toBe(true);
  });

  it('deve fechar o modal', () => {
    component.abrirCadastro();
    component.cancelarFormulario();

    expect(component.formularioAberto()).toBe(false);
  });

  it('deve cadastrar um pet com informações válidas', () => {
    preencherFormulario();

    component.abrirCadastro();
    preencherFormulario();
    component.salvar();

    expect(component.pets().length).toBe(1);
    expect(component.pets()[0].nome).toBe('Bob');
    expect(component.pets()[0].especie).toBe('Cachorro');
  });

  it('não deve cadastrar um pet com campos obrigatórios vazios', () => {
    component.abrirCadastro();
    component.salvar();

    expect(component.pets().length).toBe(0);
    expect(component.erro()).not.toBe('');
  });

  it('deve permitir cadastro sem data quando nascimento for desconhecido', () => {
    preencherFormulario();
    component.dataNascimento = '';
    component.salvar();

    expect(component.pets().length).toBe(1);
    expect(component.pets()[0].dataNascimento).toBeNull();
  });

  it('deve abrir o modal de edição com os dados do pet', () => {
    preencherFormulario();
    component.salvar();

    const pet = component.pets()[0];

    component.editar(pet);

    expect(component.formularioAberto()).toBe(true);
    expect(component.nome).toBe('Bob');
    expect(component.raca).toBe('Golden Retriever');
  });

  it('deve salvar as alterações de um pet', () => {
    preencherFormulario();
    component.salvar();

    const pet = component.pets()[0];

    component.editar(pet);
    component.nome = 'Bob Atualizado';
    component.salvar();

    expect(component.pets().length).toBe(1);
    expect(component.pets()[0].nome).toBe('Bob Atualizado');
  });

  it('deve abrir o modal de remoção', () => {
    preencherFormulario();
    component.salvar();

    const pet = component.pets()[0];

    component.solicitarExclusao(pet.id);

    expect(component.petParaExcluir()).toBe(pet.id);
  });

  it('deve remover o pet após confirmação', () => {
    preencherFormulario();
    component.salvar();

    const pet = component.pets()[0];

    component.solicitarExclusao(pet.id);
    component.confirmarExclusao();

    expect(component.pets().length).toBe(0);
  });

  it('não deve remover o pet ao cancelar a remoção', () => {
    preencherFormulario();
    component.salvar();

    const pet = component.pets()[0];

    component.solicitarExclusao(pet.id);
    component.cancelarExclusao();

    expect(component.pets().length).toBe(1);
  });

  it('deve formatar a data para o padrão brasileiro', () => {
    expect(component.formatarData('2020-01-15')).toBe('15/01/2020');
  });

  it('deve mostrar "Não informada" quando não houver data', () => {
    expect(component.formatarData('')).toBe('Não informada');
  });
});
