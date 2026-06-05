import { TestBed } from '@angular/core/testing';

import { ExecutiveService } from './executive';

describe('Student', () => {
  let service: ExecutiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExecutiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
