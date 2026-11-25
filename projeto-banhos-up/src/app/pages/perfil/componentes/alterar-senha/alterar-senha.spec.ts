import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlterarSenha } from './alterar-senha';

describe('AlterarSenha', () => {
  let component: AlterarSenha;
  let fixture: ComponentFixture<AlterarSenha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlterarSenha]
    }).compileComponents();

    fixture = TestBed.createComponent(AlterarSenha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve alternar a visibilidade da senha atual', () => {
    expect(component.mostrarSenhaAtual()).toBe(false);

    component.alternarSenhaAtual();

    expect(component.mostrarSenhaAtual()).toBe(true);
  });

  it('deve alternar a visibilidade da nova senha', () => {
    expect(component.mostrarNovaSenha()).toBe(false);

    component.alternarNovaSenha();

    expect(component.mostrarNovaSenha()).toBe(true);
  });

  it('deve alternar a visibilidade da confirmação', () => {
    expect(component.mostrarConfirmacaoSenha()).toBe(false);

    component.alternarConfirmacaoSenha();

    expect(component.mostrarConfirmacaoSenha()).toBe(true);
  });

  it('deve validar a senha atual mockada', () => {
    component.senhaAtual = 'Banhos@123';

    expect(component.senhaAtualValida).toBe(true);
  });

  it('deve rejeitar uma senha atual incorreta', () => {
    component.senhaAtual = 'SenhaErrada@123';

    expect(component.senhaAtualValida).toBe(false);
  });

  it('deve validar uma nova senha que atende aos requisitos', () => {
    component.senhaAtual = 'Banhos@123';
    component.novaSenha = 'NovaSenha@456';

    expect(component.senhaMinima).toBe(true);
    expect(component.senhaMaiuscula).toBe(true);
    expect(component.senhaMinuscula).toBe(true);
    expect(component.senhaEspecial).toBe(true);
    expect(component.senhaNumero).toBe(true);
    expect(component.novaSenhaValida).toBe(true);
  });

  it('deve rejeitar uma nova senha sem letra maiúscula', () => {
    component.senhaAtual = 'Banhos@123';
    component.novaSenha = 'novasenha@456';

    expect(component.senhaMaiuscula).toBe(false);
    expect(component.novaSenhaValida).toBe(false);
  });

  it('deve rejeitar uma nova senha igual à senha atual', () => {
    component.senhaAtual = 'Banhos@123';
    component.novaSenha = 'Banhos@123';

    expect(component.novaSenhaValida).toBe(false);
  });

  it('deve validar quando a confirmação coincide com a nova senha', () => {
    component.novaSenha = 'NovaSenha@456';
    component.confirmarSenha = 'NovaSenha@456';

    expect(component.confirmacaoValida).toBe(true);
  });

  it('deve rejeitar confirmações diferentes', () => {
    component.novaSenha = 'NovaSenha@456';
    component.confirmarSenha = 'OutraSenha@456';

    expect(component.confirmacaoValida).toBe(false);
  });

  it('deve indicar tentativa de alteração quando os dados forem inválidos', () => {
    component.alterarSenha();

    expect(component.tentouAlterar).toBe(true);
    expect(component.formularioValido).toBe(false);
  });

  it('deve limpar os campos após uma alteração válida', () => {
    component.senhaAtual = 'Banhos@123';
    component.novaSenha = 'NovaSenha@456';
    component.confirmarSenha = 'NovaSenha@456';

    component.alterarSenha();

    expect(component.senhaAtual).toBe('');
    expect(component.novaSenha).toBe('');
    expect(component.confirmarSenha).toBe('');
    expect(component.tentouAlterar).toBe(false);
  });
});
