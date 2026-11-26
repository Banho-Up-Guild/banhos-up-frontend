import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HeaderV2 } from './header-v2';

describe('HeaderV2', () => {
  let component: HeaderV2;
  let fixture: ComponentFixture<HeaderV2>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderV2],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderV2);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
