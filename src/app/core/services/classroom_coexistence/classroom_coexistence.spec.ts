import { TestBed } from '@angular/core/testing';

import { ClassroomService } from './classroom_coexistence';

describe('Student', () => {
  let service: ClassroomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClassroomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});