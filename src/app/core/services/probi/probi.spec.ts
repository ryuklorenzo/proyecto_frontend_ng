import { TestBed } from '@angular/core/testing';

import { ProbiService } from './probi';

describe('Student', () => {
  let service: ProbiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProbiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});