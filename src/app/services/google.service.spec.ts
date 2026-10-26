import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { languages } from 'google-translate-api-x';
import { GoogleTranslateService } from './google.service';
import Browser from 'webextension-polyfill';
import { Transaltor } from '../interfaces/settings-interfaces';

describe('GoogleService', () => {
  let service: GoogleTranslateService;

  beforeEach(() => {
    service = new GoogleTranslateService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLanguages method', () => {
    it('should return mapped changes', () => {
      const sub = subscribeSpyTo(service.getLanguages());

      expect(sub.getFirstValue()?.length).toBe(
        Object.keys(languages).length
      );
    });
  });

  describe('translate method', () => {
    it('should translate', async () => {
      vi.mocked(Browser.runtime.sendMessage).mockResolvedValue({
        result: {
          text: 'Ciao'
        }
      });

      const sub = subscribeSpyTo(service.translate(
        'en', 'it', 'Hello'
      ));
      await sub.onComplete();

      expect(sub.getFirstValue()).toStrictEqual({
        confidence: undefined,
        original: 'Hello',
        result: 'Ciao',
        source: 'en',
        target: 'it',
        translator: Transaltor.GOOGLE
      });
    });
  });
});
