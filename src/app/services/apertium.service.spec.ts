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

  describe('getLanguages method', () => {
    it('should retrieve and map languages', (done) => {
      service.getLanguageNames = jest.fn(() => of({ 'eng': 'English', 'it': 'Italian', 'spa': 'Spanish' }));
      mockHttpClient.get.mockReturnValue(of({
        responseData: [
          { sourceLanguage: 'it', targetLanguage: 'spa' },
          { sourceLanguage: 'eng', targetLanguage: 'spa' },
          { sourceLanguage: 'spa', targetLanguage: 'eng' },
          { sourceLanguage: 'spa', targetLanguage: 'it' }
        ]
      }))

      service.getLanguages().subscribe(
        (res) => {
          expect(res).toStrictEqual(
            [
              { code: 'it', name: 'Italian', pairsWith: ['spa'] },
              { code: 'eng', name: 'English', pairsWith: ['spa'] },
              { code: 'spa', name: 'Spanish', pairsWith: ['it', 'eng'] }
            ]
          );
          done();
        }
      );
    });
  });

  describe('getLanguageNames method', () => {
    it('should retrieve language names', (done) => {
      mockHttpClient.get.mockReturnValue(
        of({ 'eng': 'English', 'it': 'Italian', 'spa': 'Spanish' })
      );

      service.getLanguageNames(['eng', 'it', 'spa']).subscribe(
        (res) => {
          expect(res).toStrictEqual({ 'eng': 'English', 'it': 'Italian', 'spa': 'Spanish' });
          done();
        }
      );
    });

    it('should filter for languages if none are provided', (done) => {
      service.getLanguageNames([]).subscribe(
        () => {
          expect(mockHttpClient.get).toHaveBeenLastCalledWith(
            'https://beta.apertium.org/apy/listLanguageNames?locale=en'
          );
          done();
        }
      );
    });
  });

  describe('detectLanguage method', () => {
    it('should get the language', (done) => {
      mockHttpClient.get.mockReturnValue(
        of({ 'eng': 0.5, 'nld': '0.5' })
      );

      service.detectLanguage('drink water').subscribe(
        (res) => {
          expect(res).toStrictEqual({ 'eng': 0.5, 'nld': '0.5' })
          done();
        }
      );
    });
  });

  describe('translate method', () => {
    it('should translate', (done) => {
      mockHttpClient.get.mockReturnValue(
        of({
          responseData: 'Hello, world!',
          responseDetails: '',
          responseCode: 200
        })
      );

      service.translate('it', 'en', 'Salve, mondo!').subscribe(
        (res) => {
          expect(res.responseData).toBe('Hello, world!');
          done();
        }
      );
    });
  })
});
