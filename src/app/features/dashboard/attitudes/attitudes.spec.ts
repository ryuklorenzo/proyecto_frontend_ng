import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Attitudes } from './attitudes';

describe('Attitudes', () => {
  let component: Attitudes;
  let fixture: ComponentFixture<Attitudes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Attitudes],
    }).compileComponents();

    fixture = TestBed.createComponent(Attitudes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
