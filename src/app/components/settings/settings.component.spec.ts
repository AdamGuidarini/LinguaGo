import { createSpyFromClass } from 'jest-auto-spies';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../services/settings.service';
import { Transaltor } from '../../interfaces/settings-interfaces';
import { of } from 'rxjs';
import { DataService } from '../../services/data.service';

const mockSettingsService = createSpyFromClass(SettingsService);
const mockDataService = createSpyFromClass(DataService);

describe('SettingsComponent', () => {
  let component: SettingsComponent;

  beforeEach(() => {
    mockSettingsService.getSettings.mockReturnValue(
      of({
        translator: Transaltor.APERTIUM
      })
    );

    component = new SettingsComponent(
      mockSettingsService,
      mockDataService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('settings$ stream', () => {
    it('should get settings', (done) => {
      component.settings$.subscribe(
        (s) => {
          expect(s).toStrictEqual({
            translator: Transaltor.APERTIUM
          });
          done();
        }
      );
    });
  });

  describe('selectedTranslator stream', () => {
    it('should update the selected translator', (done) => {
      component.selectedTranslator$.subscribe(
        (t) => {
          if (t === Transaltor.GOOGLE) {
            expect(t).toBe(Transaltor.GOOGLE);
            expect(mockSettingsService.saveSettings).toHaveBeenLastCalledWith(
              { translator: Transaltor.GOOGLE }
            );

            done();
          }
        }
      );

      component.selectedTranslatorSubject.next(
        Transaltor.GOOGLE
      );
    });

    describe('libreTranslateUrl$ stream', () => {
      it('should set the URL', (done) => {
        component.libreTranslateUrl$.subscribe(
          (url) => {
            if (url === 'https://foo.com') {
              expect(url).toBe('https://foo.com');

              done();
            }
          }
        );

        component.libreTranslateUrlSubject.next(
          'https://foo.com'
        );
      });

      it('should not update the URL if it has not changed', (done) => {
        mockSettingsService.saveSettings.mockClear();

        let first = true;
        component.libreTranslateUrl$.subscribe(
          (url) => {
            if (first) {
              first = false;
              return;
            }
            expect(mockSettingsService.saveSettings)
              .toHaveBeenCalledTimes(1);
            expect(url).toBe('https://foo.com');

            done();
          }
        );

        component.libreTranslateUrlSubject.next('https://foo.com');
        component.libreTranslateUrlSubject.next('https://foo.com');
      });
    });
  });

  describe('libreTranslateKey$ stream', () => {
    it('should update the key', (done) => {
      component.libreTranslateKey$.subscribe(
        (key) => {
          if (key === 'hello') {
            expect(key).toBe('hello');

            done();
          }
        }
      );

      component.libreTranslateKeySubject.next(
        'hello'
      );
    });

    it('should not update the key if it has not changed', (done) => {
      mockSettingsService.saveSettings.mockClear();

      let first = true;
      component.libreTranslateKey$.subscribe(
        () => {
          if (first) {
            first = false;
            return;
          }

          expect(mockSettingsService.saveSettings)
            .toHaveBeenCalledTimes(1);

          done();
        }
      );

      component.libreTranslateKeySubject.next('foo');
      component.libreTranslateKeySubject.next('foo');
    });
  });

  describe('vm$ stream', () => {
    it('should collect streams', (done) => {
      component.vm$.subscribe(
        (vm) => {
          expect(Object.keys(vm)).toStrictEqual(
            [
              'selectedTranslator',
              'libreTranslateUrl',
              'libreTranslateKey',
              'settings'
            ]
          );
          done();
        }
      );
    });
  });
});
