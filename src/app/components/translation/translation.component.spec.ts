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
          expect(res).toStrictEqual([
            { code: 'spa', name: 'Spanish', targets: ['it', 'eng'] }
          ]);
          done();
        }
      );

      mockSettingsBS.next({ translator: Transaltor.APERTIUM });
      component.sourceSubject.next('eng');
    });

    it('set targetLanguages to languages if source is auto', (done) => {
      component.targetLanguages$.subscribe(
        (res) => {
          expect(res).toStrictEqual(langList);
          done();
        }
      );

      component.targetSubject.next('nld');
      component.sourceSubject.next('auto');
    });
  });

  describe('translate$ stream', () => {
    it('should not translate if there is no source', async () => {
      component.sourceSubject.next('eng');
      component.targetSubject.next('spa');
      component.translateSubject.next();

      await firstValueFrom(component.translate$);

      expect(mockApertiumService.translate).not.toHaveBeenCalled();
    });
  });
});
