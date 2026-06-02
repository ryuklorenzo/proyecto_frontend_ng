import { TestBed } from '@angular/core/testing';

import { MentionService } from './mention';

describe('Student', () => {
  let service: MentionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MentionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});