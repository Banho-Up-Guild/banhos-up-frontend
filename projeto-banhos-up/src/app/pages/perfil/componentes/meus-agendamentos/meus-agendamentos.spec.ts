import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MeusAgendamentos } from './meus-agendamentos';

describe('MeusAgendamentos', () => {
  let component: MeusAgendamentos;
  let fixture: ComponentFixture<MeusAgendamentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusAgendamentos],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MeusAgendamentos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar na aba de próximos agendamentos', () => {
    expect(component.abaAtiva()).toBe('proximos');
  });

  it('deve possuir um agendamento próximo de exemplo', () => {
    expect(component.agendamentosProximos.length).toBe(1);
    expect(component.agendamentosProximos[0].status).toBe('agendado');
  });

  it('deve possuir dois agendamentos anteriores de exemplo', () => {
    expect(component.agendamentosAnteriores.length).toBe(2);
  });

  it('deve trocar para a aba de anteriores', () => {
    component.selecionarAba('anteriores');

    expect(component.abaAtiva()).toBe('anteriores');
    expect(component.agendamentosExibidos.length).toBe(2);
  });

  it('deve trocar para a aba de próximos', () => {
    component.selecionarAba('anteriores');
    component.selecionarAba('proximos');

    expect(component.abaAtiva()).toBe('proximos');
    expect(component.agendamentosExibidos.length).toBe(1);
  });

  it('deve abrir o modal de reagendamento', () => {
    const agendamento = component.agendamentosProximos[0];

    component.abrirModalReagendar(agendamento);

    expect(component.modalReagendarAberto()).toBe(true);
    expect(component.agendamentoSelecionado).toBe(agendamento.id);
  });

  it('deve preencher os campos com os dados atuais ao reagendar', () => {
    const agendamento = component.agendamentosProximos[0];

    component.abrirModalReagendar(agendamento);

    expect(component.novaData).toBe(agendamento.data);
    expect(component.novoHorario).toBe('09:30');
  });

  it('deve fechar o modal de reagendamento', () => {
    const agendamento = component.agendamentosProximos[0];

    component.abrirModalReagendar(agendamento);
    component.fecharModalReagendar();

    expect(component.modalReagendarAberto()).toBe(false);
    expect(component.agendamentoSelecionado).toBe(null);
  });

  it('não deve salvar reagendamento sem data e horário', () => {
    const agendamento = component.agendamentosProximos[0];

    component.abrirModalReagendar(agendamento);
    component.novaData = '';
    component.novoHorario = '';

    component.salvarReagendamento();

    expect(component.tentouSalvarReagendamento).toBe(true);
    expect(component.agendamentosProximos[0].data).toBe(agendamento.data);
  });

  it('deve atualizar a data e o horário do agendamento', () => {
    const agendamento = component.agendamentosProximos[0];

    component.abrirModalReagendar(agendamento);

    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);

    const ano = amanha.getFullYear();
    const mes = String(amanha.getMonth() + 1).padStart(2, '0');
    const dia = String(amanha.getDate()).padStart(2, '0');

    component.novaData = `${ano}-${mes}-${dia}`;
    component.novoHorario = '14:00';

    component.salvarReagendamento();

    expect(component.agendamentosProximos[0].data).toBe(component.dataMinima === component.novaData ? component.dataMinima : `${ano}-${mes}-${dia}`);
    expect(component.agendamentosProximos[0].horario).toBe('14:00 até 15:30');
    expect(component.modalReagendarAberto()).toBe(false);
  });

  it('não deve aceitar uma data anterior a hoje', () => {
    const agendamento = component.agendamentosProximos[0];

    component.abrirModalReagendar(agendamento);
    component.novaData = '2000-01-01';
    component.novoHorario = '14:00';

    component.salvarReagendamento();

    expect(component.modalReagendarAberto()).toBe(true);
    expect(component.agendamentosProximos[0].data).toBe(agendamento.data);
  });

  it('deve calcular o horário final considerando 90 minutos', () => {
    expect(component.calcularHorarioFinal('09:30')).toBe('11:00');
  });

  it('deve abrir o modal de cancelamento', () => {
    const agendamento = component.agendamentosProximos[0];

    component.abrirModalCancelar(agendamento);

    expect(component.modalCancelarAberto()).toBe(true);
    expect(component.agendamentoSelecionado).toBe(agendamento.id);
  });

  it('deve fechar o modal de cancelamento sem alterar o agendamento', () => {
    const agendamento = component.agendamentosProximos[0];

    component.abrirModalCancelar(agendamento);
    component.fecharModalCancelar();

    expect(component.modalCancelarAberto()).toBe(false);
    expect(component.agendamentosProximos.length).toBe(1);
  });

  it('deve cancelar o agendamento após confirmação', () => {
    const agendamento = component.agendamentosProximos[0];

    component.abrirModalCancelar(agendamento);
    component.confirmarCancelamento();

    expect(component.agendamentosProximos.length).toBe(0);
    expect(component.agendamentosAnteriores.length).toBe(3);
  });

  it('deve formatar a data no padrão brasileiro com dia da semana', () => {
    expect(component.formatarData('2026-10-03')).toBe(
      'Sábado, 03/10/2026'
    );
  });

  it('deve disponibilizar a data atual como limite mínimo', () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    expect(component.dataMinima).toBe(`${ano}-${mes}-${dia}`);
  });

  it('deve exibir a mensagem quando não houver agendamentos próximos', () => {
    component.agendamentos.set([]);
    component.selecionarAba('proximos');
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent;

    expect(texto).toContain('Você não possui agendamentos próximos.');
  });

  it('deve exibir a mensagem quando não houver agendamentos anteriores', () => {
    component.agendamentos.set([]);
    component.selecionarAba('anteriores');
    fixture.detectChanges();

    const texto = fixture.nativeElement.textContent;

    expect(texto).toContain('Você ainda não possui agendamentos anteriores.');
  });
});
