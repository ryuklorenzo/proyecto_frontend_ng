import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Previ } from './previ';

describe('Previ', () => {
  let component: Previ;
  let fixture: ComponentFixture<Previ>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Previ],
    }).compileComponents();

    fixture = TestBed.createComponent(Previ);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
