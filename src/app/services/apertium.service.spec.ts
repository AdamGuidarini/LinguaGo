import { createSpyFromClass } from 'jest-auto-spies';
import { ApertiumService } from './apertium.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

const mockHttpClient = createSpyFromClass(HttpClient);

describe('ApertiumService', () => {
  let service: ApertiumService;

  beforeEach(() => {
    service = new ApertiumService(mockHttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('translate method', () => {
    it('should translate', () => {
      mockHttpClient.get.mockReturnValue(
        of({
          responseData: 'Hello, world!',
          responseDetails: '',
          responseCode: 200
        })
      );

      service.translate('it', 'en', 'Salve, mondo!').subscribe(
        (res) => expect(res.responseData).toBe('Hello, world!')
      );
    });
  })
});
