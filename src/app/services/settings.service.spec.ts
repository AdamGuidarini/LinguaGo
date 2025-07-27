import { Transaltor } from '../interfaces/settings-interfaces';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'setItem');
    jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(
      '{ "translator": "apertium" }'
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
          expect(res).toStrictEqual({ translator: 'apertium' });
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
