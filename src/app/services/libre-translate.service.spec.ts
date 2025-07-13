import { TestBed } from '@angular/core/testing';

import { LibreTranslateService } from './libre-translate.service';

describe('LibreTranslateService', () => {
  let service: LibreTranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibreTranslateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
