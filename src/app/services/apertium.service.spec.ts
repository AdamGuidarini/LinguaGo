import { TestBed } from '@angular/core/testing';

import { ApertiumService } from './apertium.service';

describe('ApertiumService', () => {
  let service: ApertiumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApertiumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
