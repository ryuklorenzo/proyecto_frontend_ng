import { TestBed } from '@angular/core/testing';

import { PreviService } from './previ';

describe('Student', () => {
  let service: PreviService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PreviService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});