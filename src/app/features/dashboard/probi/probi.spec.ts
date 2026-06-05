import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Probi } from './probi';

describe('Probi', () => {
  let component: Probi;
  let fixture: ComponentFixture<Probi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Probi],
    }).compileComponents();

    fixture = TestBed.createComponent(Probi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
