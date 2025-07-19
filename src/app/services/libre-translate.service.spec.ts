import { HttpClient } from '@angular/common/http';
import { createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';
import { Transaltor } from '../interfaces/settings-interfaces';
import { LibreTranslateService } from './libre-translate.service';
import { SettingsService } from './settings.service';

const mockHttpClient = createSpyFromClass(HttpClient);
const mockSettingsService = createSpyFromClass(SettingsService);

describe('LibreTranslateService', () => {
  let service: LibreTranslateService;

  beforeEach(() => {
    mockSettingsService.getSettings.mockReturnValue(
      { translator: Transaltor.APERTIUM, libreTranslateUrl: 'https://libretranslate.com' }
    );

    service = new LibreTranslateService(
      mockHttpClient,
      mockSettingsService
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLanguages method', () => {
    it('should get all languages', () => {
      const langList = [
        { name: 'Foo', code: 'bar', targets: [] }
      ];

      mockHttpClient.get.mockReturnValue(
        of(langList)
      );

      service.getLanguages().subscribe(
        (langs) => expect(langs).toBe(langList)
      );
    });
  });

  describe('translate method', () => {
    it('should send a translation request', (done) => {
      mockHttpClient.post.mockReturnValue(
        of({ translatedText: 'Hola, mi amigo!' })
      );

      service.translate(
        'en', 'es', 'Hello, my friend!'
      ).subscribe(
        (res) => {
          expect(res.translatedText).toBe(
            'Hola, mi amigo!'
          );

          done();
        }
      );
    });
  });
});
