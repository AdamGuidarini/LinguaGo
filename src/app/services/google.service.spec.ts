import { TestBed } from '@angular/core/testing';

import { GoogleTranslateService } from './google.service';

describe('GoogleService', () => {
  let service: GoogleTranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleTranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
