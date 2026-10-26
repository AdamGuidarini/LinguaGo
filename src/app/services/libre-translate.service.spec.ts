import { beforeEach, describe, expect, it } from 'vitest';
import { HttpClient } from '@angular/common/http';
import { mock } from 'vitest-mock-extended';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { of } from 'rxjs';
import { Transaltor } from '../interfaces/settings-interfaces';
import { LibreTranslateService } from './libre-translate.service';
import { SettingsService } from './settings.service';

const mockHttpClient = mock<HttpClient>();
const mockSettingsService = mock<SettingsService>();

describe('LibreTranslateService', () => {
  let service: LibreTranslateService;

  beforeEach(() => {
    mockSettingsService.getSettings.mockReturnValue(
      of({ translator: Transaltor.APERTIUM, libreTranslateUrl: 'https://libretranslate.com' })
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
      const langList = [{ name: 'Foo', code: 'bar', targets: [] }];

      mockHttpClient.get.mockReturnValue(
        of(langList)
      );

      service.getLanguages().subscribe(
        (langs) => expect(langs).toBe(langList)
      );
    });

    it('should return an empty array if no url is found', () => {
      mockSettingsService.getSettings.mockReturnValue(
        of({ translator: Transaltor.LIBRETRANSLATE })
      );

      service.getLanguages().subscribe(
        (langs) => expect(langs).toStrictEqual([])
      );
    });
  });

  describe('translate method', () => {
    it('should send a translation request', () => {
      mockHttpClient.post.mockReturnValue(
        of({ translatedText: 'Hola, mi amigo!' })
      );

      const sub = subscribeSpyTo(service.translate(
        'en', 'es', 'Hello, my friend!'
      ));

      expect(sub.getFirstValue().result).toBe(
        'Hola, mi amigo!'
      );
    });

    it('should send a translation request', () => {
      mockHttpClient.post.mockReturnValue(
        of({
          translatedText: 'Hola, mi amigo!',
          detectedLanguage: { language: 'en', confidence: 0.9 }
        })
      );

      const sub = subscribeSpyTo(service.translate(
        'auto', 'es', 'Hello, my friend!'
      ));

      expect(sub.getFirstValue().result).toBe(
        'Hola, mi amigo!'
      );
    });
  });
});
