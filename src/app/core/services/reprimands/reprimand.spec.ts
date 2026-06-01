import { TestBed } from '@angular/core/testing';

import { ReprimandService } from './reprimand';

describe('Student', () => {
  let service: ReprimandService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReprimandService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});