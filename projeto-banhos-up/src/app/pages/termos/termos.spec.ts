import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Location } from '@angular/common';
import { TermosCondicoesComponent } from './termos';

describe('TermosCondicoesComponent', () => {
  let component: TermosCondicoesComponent;
  let fixture: ComponentFixture<TermosCondicoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermosCondicoesComponent],
      providers: [{ provide: Location, useValue: { back: () => undefined } }]
    }).compileComponents();

    fixture = TestBed.createComponent(TermosCondicoesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
