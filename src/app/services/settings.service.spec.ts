import { Transaltor } from '../interfaces/settings-interfaces';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(
      '{ "translator": "google" }'
    );

    service = new SettingsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSettings method', () => {
    it('should return the settings observable', (done) => {
      service.getSettings().subscribe(
        (res) => {
          expect(res).toStrictEqual({ translator: 'google' });
          done();
        }
      );
    });

    it('should return the default settings of no settings are found', (done) => {
      jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(
        null
      );

      service = new SettingsService();

      service.getSettings().subscribe(
        (settings) => {
          expect(settings).toStrictEqual(
            { translator: Transaltor.APERTIUM }
          );
          done();
        }
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
