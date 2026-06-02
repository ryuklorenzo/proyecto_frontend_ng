import { TestBed } from '@angular/core/testing';

import { ClassroomService } from './aula-convivencia';

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