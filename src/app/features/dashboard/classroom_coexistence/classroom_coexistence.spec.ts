import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AulaConvivencia } from './classroom_coexistence';

describe('AulaConvivencia', () => {
  let component: AulaConvivencia;
  let fixture: ComponentFixture<AulaConvivencia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AulaConvivencia],
    }).compileComponents();

    fixture = TestBed.createComponent(AulaConvivencia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
