import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reprimands } from './reprimands';

describe('Reprimands', () => {
  let component: Reprimands;
  let fixture: ComponentFixture<Reprimands>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reprimands],
    }).compileComponents();

    fixture = TestBed.createComponent(Reprimands);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
