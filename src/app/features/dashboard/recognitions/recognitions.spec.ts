import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recognitions } from './recognitions';

describe('Recognitions', () => {
  let component: Recognitions;
  let fixture: ComponentFixture<Recognitions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recognitions],
    }).compileComponents();

    fixture = TestBed.createComponent(Recognitions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
