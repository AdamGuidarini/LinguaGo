/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSpyFromClass } from 'jest-auto-spies';
import { BehaviorSubject, firstValueFrom, of, take, throwError } from 'rxjs';
import { ILanguage } from '../../interfaces/global-transation-interfaces';
import { ISettings, Transaltor } from '../../interfaces/settings-interfaces';
import { ApertiumService } from '../../services/apertium.service';
import { GoogleTranslateService } from '../../services/google.service';
import { LibreTranslateService } from '../../services/libre-translate.service';
import { SettingsService } from '../../services/settings.service';
import { TabsService } from '../../services/tabs.service';
import { TranslationComponent } from './translation.component';

jest.mock('webextension-polyfill');

const mockApertiumService = createSpyFromClass(ApertiumService);
const mockLibreTranslateService = createSpyFromClass(LibreTranslateService);
const mockGoogleTranslateService = createSpyFromClass(GoogleTranslateService);
const mockSettingsService = createSpyFromClass(SettingsService);
const mockTabsService = createSpyFromClass(TabsService);

const langList: ILanguage[] = [
  { code: 'it', name: 'Italian', targets: ['spa'] },
  { code: 'eng', name: 'English', targets: ['spa'] },
  { code: 'spa', name: 'Spanish', targets: ['it', 'eng'] }
];

const mockSettingsBS = new BehaviorSubject<ISettings>(
  { translator: Transaltor.APERTIUM }
);

describe('TranslationComponent', () => {
  let component: TranslationComponent;

  beforeEach(async () => {
    mockApertiumService.getLanguages.mockReturnValue(
      of(langList)
    );
    mockLibreTranslateService.getLanguages.mockReturnValue(
      of(langList)
    );
    mockGoogleTranslateService.getLanguages.mockReturnValue(
      of(langList)
    );
    mockSettingsService.getSettings.mockReturnValue(
      mockSettingsBS.asObservable()
    );
    mockSettingsService.saveSettings.mockImplementation(
      (settings) => mockSettingsBS.next(settings)
    );
    mockTabsService.getCurrentTab.mockReturnValue(of(0));

    component = new TranslationComponent(
      mockApertiumService,
      mockLibreTranslateService,
      mockGoogleTranslateService,
      mockSettingsService,
      mockTabsService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('currentTab$ stream', () => {
    it('should clear the error', (done) => {
      component.error$.subscribe(
        (res) => {
          expect(res).toBe('');
          done();
        }
      );

      component.errorSubject.next('hello!');
      mockTabsService.changeTab(0);
    });

    it('should not clear the error', (done) => {
      component.error$.subscribe(
        (res) => {
          expect(res).toBe('hello!');
          done();
        }
      );

      component.errorSubject.next('hello!');
      mockTabsService.changeTab(1);
    });
  });

  describe('languages stream', () => {
    it('should populate languages from Apertium', (done) => {
      component.languages$.subscribe(
        () => {
          expect(mockApertiumService.getLanguages).toHaveBeenCalled();
          done();
        }
      );
    });

    it('should get languages from Libretranslate', (done) => {
      component.languages$.subscribe(
        () => {
          expect(mockLibreTranslateService.getLanguages).toHaveBeenCalled();
          done();
        }
      );

      mockSettingsBS.next({ translator: Transaltor.LIBRETRANSLATE });
    });

    it('should get languages from Google', (done) => {
      component.languages$.subscribe(
        () => {
          expect(mockGoogleTranslateService.getLanguages).toHaveBeenCalled();
          done();
        }
      );

      mockSettingsBS.next({ translator: Transaltor.GOOGLE });
    });

    it('should log if it cannot retrieve languages', (done) => {
      mockApertiumService.getLanguages.mockReturnValue(
        throwError(() => new Error('Oh no!'))
      );

      component.languages$.pipe(
        take(1)
      ).subscribe(
        (res) => {
          if (res.length === 0) {
            expect(res).toStrictEqual([]);
            done();
          }
        }
      );

      mockSettingsBS.next({ translator: Transaltor.APERTIUM });
    });
  });

  describe('source$ stream', () => {
    it('should set the source language', (done) => {
      component.sourceSubject.next('eng');

      component.source$.subscribe(
        (res) => {
          expect(res).toBe('eng');
          done();
        }
      );
    });
  });

  describe('target$ stream', () => {
    it('should set the target language', (done) => {
      component.targetSubject.next('nld');

      component.target$.subscribe(
        (tar) => {
          expect(tar).toBe('nld');
          done();
        }
      );
    });
  });

  describe('targetLanguages$ stream', () => {
    it('should filter out languages the source cannot target', (done) => {
      component.targetLanguages$.subscribe(
        (res) => {
          if (res.length > 0) {
            expect(res).toStrictEqual([
              { code: 'spa', name: 'Spanish', targets: ['it', 'eng'] }
            ]);
            done();
          }
        }
      );

      mockSettingsBS.next({ translator: Transaltor.APERTIUM });
      component.sourceSubject.next('eng');
    });

    it('set targetLanguages to languages if source is auto', (done) => {
      component.targetLanguages$.subscribe(
        (res) => {
          if (res.length > 0) {
            expect(res).toStrictEqual(langList);
            done();
          }
        }
      );

      component.targetSubject.next('nld');
      component.sourceSubject.next('auto');
    });

    it('should return all languages expect auto for Google Translate', (done) => {
      component.targetLanguages$.subscribe(
        (res) => {
          const ll = [...langList];
          ll.shift();

          expect(res).toStrictEqual(ll);
          done();
        }
      );

      mockSettingsService.saveSettings({
        translator: Transaltor.GOOGLE
      });
    });

    it('should unset the target language if source cannot translate to it', (done) => {
      component.targetLanguages$.subscribe();
      component.target$.subscribe(
        (res) => {
          expect(res).toBe('');
          done();
        }
      );

      component.targetSubject.next('en');
      component.sourceSubject.next('it');
    });
  });

  describe('translate$ stream', () => {
    beforeEach(() => {
      mockApertiumService.translate.mockReturnValue(
        of({ result: 'Hola' } as any)
      );
      mockGoogleTranslateService.translate.mockReturnValue(
        of({ result: 'Hallo' } as any)
      );
      mockLibreTranslateService.translate.mockReturnValue(
        of({ result: 'Salve' } as any)
      );

      mockTabsService.changeTab(0);
    });

    it('should not translate if there is no source', async () => {
      component.sourceSubject.next('eng');
      component.targetSubject.next('spa');
      component.translateSubject.next();

      await firstValueFrom(component.translate$);

      expect(mockApertiumService.translate).not.toHaveBeenCalled();
    });

    it('should translate - Apertium', (done) => {
      component.translate$.subscribe(
        (res) => {
          if (res) {
            expect(res).toStrictEqual({ result: 'Hola' });
            expect(mockApertiumService.translate).toHaveBeenCalled();
            done();
          }
        }
      );

      mockSettingsBS.next({ translator: Transaltor.APERTIUM });

      component.sourceSubject.next('eng');
      component.targetSubject.next('spa');
      component.textToTranslateSubject.next('Hello');
      component.translateSubject.next();
    });

    it('should translate - LibreTranslate', (done) => {
      component.translate$.subscribe(
        (res) => {
          if (res) {
            expect(res).toStrictEqual({ result: 'Salve' });
            expect(mockLibreTranslateService.translate).toHaveBeenCalled();
            done();
          }
        }
      );

      mockSettingsBS.next({ translator: Transaltor.LIBRETRANSLATE });
      component.sourceSubject.next('eng');
      component.targetSubject.next('it');
      component.textToTranslateSubject.next('Hello');
      component.translateSubject.next();
    });

    it('should translate - GoogleTranslate', (done) => {
      component.translate$.subscribe(
        (res) => {
          if (res) {
            expect(res).toStrictEqual({ result: 'Hallo' });
            expect(mockGoogleTranslateService.translate).toHaveBeenCalled();
            done();
          }
        }
      );

      mockSettingsBS.next({ translator: Transaltor.GOOGLE });
      component.sourceSubject.next('eng');
      component.targetSubject.next('nl');
      component.textToTranslateSubject.next('Hello');
      component.translateSubject.next();
    });

    it('should set an error if one occurs', (done) => {
      component.translate$.subscribe();
      component.error$.subscribe(
        (res) => {
          expect(res).toBe('Translation failed with error: Oh no!');
          done();
        }
      );

      mockSettingsBS.next({ translator: Transaltor.APERTIUM });
      mockApertiumService.translate.mockReturnValueOnce(
        throwError(() => new Error('Oh no!'))
      );

      component.sourceSubject.next('eng');
      component.targetSubject.next('nl');
      component.textToTranslateSubject.next('Hello');
      component.translateSubject.next();
    });
  });

  describe('vm$ stream', () => {
    it('should map the stream', async () => {
      const res = await firstValueFrom(component.vm$);

      expect(Object.keys(res).length).toBe(9);
    });
  });
});
