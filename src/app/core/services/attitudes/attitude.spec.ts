import { TestBed } from '@angular/core/testing';

import { AttitudeService } from './attitude';

describe('Student', () => {
  let service: AttitudeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttitudeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});