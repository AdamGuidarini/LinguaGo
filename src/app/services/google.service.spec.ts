import { languages } from 'google-translate-api-x';
import { GoogleTranslateService } from './google.service';
import Browser from 'webextension-polyfill';
import { Transaltor } from '../interfaces/settings-interfaces';

jest.mock('webextension-polyfill');

describe('GoogleService', () => {
  let service: GoogleTranslateService;

  beforeEach(() => {
    service = new GoogleTranslateService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLanguages method', () => {
    it('should return mapped changes', (done) => {
      service.getLanguages().subscribe(
        (res) => {
          expect(res.length).toBe(
            Object.keys(languages).length
          );

          done();
        }
      );
    });
  });

  describe('translate method', () => {
    it('should translate', (done) => {
      (Browser.runtime.sendMessage as jest.Mock).mockResolvedValue({
        result: {
          text: 'Ciao'
        }
      });

      service.translate(
        'en', 'it', 'Hello'
      ).subscribe(
        (result) => {
          expect(result).toStrictEqual({
            confidence: undefined,
            original: 'Hello',
            result: 'Ciao',
            source: 'en',
            target: 'it',
            translator: Transaltor.GOOGLE
          });
          done();
        }
      );
    });
  });
});
