import { TestBed } from '@angular/core/testing';

import { RecordSercive } from './record';

describe('Student', () => {
  let service: RecordSercive;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecordSercive);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
