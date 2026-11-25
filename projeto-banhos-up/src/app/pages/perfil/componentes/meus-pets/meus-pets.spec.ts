import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeusPets } from './meus-pets';

describe('MeusPets', () => {
  let component: MeusPets;
  let fixture: ComponentFixture<MeusPets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusPets]
    }).compileComponents();

    fixture = TestBed.createComponent(MeusPets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function preencherFormulario(): void {
    component.nome = 'Bob';
    component.tipo = 'Cachorro';
    component.raca = 'Golden Retriever';
    component.cor = 'Dourado';
    component.dataNascimento = '2020-01-01';
    component.nascimentoDesconhecido = false;
  }

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar sem nenhum pet cadastrado', () => {
    expect(component.pets().length).toBe(0);
  });

  it('deve abrir o modal de cadastro', () => {
    component.abrirModalCadastro();

    expect(component.modalAberto()).toBe('cadastro');
  });

  it('deve fechar o modal', () => {
    component.abrirModalCadastro();
    component.fecharModal();

    expect(component.modalAberto()).toBe(null);
  });

  it('deve cadastrar um pet com informações válidas', () => {
    preencherFormulario();

    component.abrirModalCadastro();
    preencherFormulario();
    component.salvarPet();

    expect(component.pets().length).toBe(1);
    expect(component.pets()[0].nome).toBe('Bob');
    expect(component.pets()[0].tipo).toBe('Cachorro');
  });

  it('não deve cadastrar um pet com campos obrigatórios vazios', () => {
    component.abrirModalCadastro();
    component.salvarPet();

    expect(component.pets().length).toBe(0);
    expect(component.tentouSalvar).toBe(true);
  });

  it('deve permitir cadastro sem data quando nascimento for desconhecido', () => {
    preencherFormulario();

    component.dataNascimento = '';
    component.nascimentoDesconhecido = true;

    component.salvarPet();

    expect(component.pets().length).toBe(1);
    expect(component.pets()[0].dataNascimento).toBe('');
    expect(component.pets()[0].nascimentoDesconhecido).toBe(true);
  });

  it('deve limpar a data ao marcar nascimento desconhecido', () => {
    component.dataNascimento = '2020-01-01';
    component.nascimentoDesconhecido = true;

    component.alterarNascimentoDesconhecido();

    expect(component.dataNascimento).toBe('');
  });

  it('não deve aceitar uma data de nascimento inexistente', () => {
    component.dataNascimento = '2020-02-31';
    component.nascimentoDesconhecido = false;

    expect(component.dataNascimentoValida).toBe(false);
  });

  it('não deve aceitar uma data de nascimento futura', () => {
    component.dataNascimento = '2999-01-01';
    component.nascimentoDesconhecido = false;

    expect(component.dataNascimentoValida).toBe(false);
  });

  it('deve abrir o modal de edição com os dados do pet', () => {
    preencherFormulario();

    component.salvarPet();

    const pet = component.pets()[0];

    component.abrirModalEdicao(pet);

    expect(component.modalAberto()).toBe('edicao');
    expect(component.nome).toBe('Bob');
    expect(component.raca).toBe('Golden Retriever');
  });

  it('deve salvar as alterações de um pet', () => {
    preencherFormulario();
    component.salvarPet();

    const pet = component.pets()[0];

    component.abrirModalEdicao(pet);
    component.nome = 'Bob Atualizado';
    component.salvarPet();

    expect(component.pets().length).toBe(1);
    expect(component.pets()[0].nome).toBe('Bob Atualizado');
  });

  it('deve abrir o modal de remoção', () => {
    preencherFormulario();
    component.salvarPet();

    const pet = component.pets()[0];

    component.abrirModalRemocao(pet);

    expect(component.modalAberto()).toBe('remocao');
  });

  it('deve remover o pet após confirmação', () => {
    preencherFormulario();
    component.salvarPet();

    const pet = component.pets()[0];

    component.abrirModalRemocao(pet);
    component.confirmarRemocao();

    expect(component.pets().length).toBe(0);
  });

  it('não deve remover o pet ao cancelar a remoção', () => {
    preencherFormulario();
    component.salvarPet();

    const pet = component.pets()[0];

    component.abrirModalRemocao(pet);
    component.fecharModal();

    expect(component.pets().length).toBe(1);
  });

  it('deve formatar a data para o padrão brasileiro', () => {
    expect(component.formatarData('2020-01-15')).toBe('15/01/2020');
  });

  it('deve mostrar "Não informada" quando não houver data', () => {
    expect(component.formatarData('')).toBe('Não informada');
  });
});
