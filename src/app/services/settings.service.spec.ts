import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Transaltor } from '../interfaces/settings-interfaces';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(
      '{ "translator": "google" }'
    );

    service = new SettingsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSettings method', () => {
    it('should return the settings observable', () => {
      const sub = subscribeSpyTo(service.getSettings());

      expect(sub.getFirstValue()).toStrictEqual({ translator: 'google' });
    });

    it('should return the default settings of no settings are found', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(
        null
      );

      service = new SettingsService();

      const sub = subscribeSpyTo(service.getSettings());

      expect(sub.getFirstValue()).toStrictEqual(
        { translator: Transaltor.APERTIUM }
      );
    });
  });

  describe('saveSettings method', () => {
    it('should set the settings item', () => {
      service.saveSettings({ translator: Transaltor.LIBRETRANSLATE });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'settings', '{"translator":"libretranslate"}'
      );
    });
  });
});
