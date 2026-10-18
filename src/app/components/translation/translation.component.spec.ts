/* eslint-disable @typescript-eslint/no-explicit-any */
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { createSpyFromClass } from 'jest-auto-spies';
import { BehaviorSubject, firstValueFrom, of, take, throwError } from 'rxjs';
import { ILanguage } from '../../interfaces/global-transation-interfaces';
import { ISettings, Transaltor } from '../../interfaces/settings-interfaces';
import { ApertiumService } from '../../services/apertium.service';
import { DataService } from '../../services/data.service';
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
const mockDataService = createSpyFromClass(DataService);

const langList: ILanguage[] = [
  { code: 'it', name: 'Italian', targets: ['spa'] },
  { code: 'eng', name: 'English', targets: ['spa'] },
  { code: 'spa', name: 'Spanish', targets: ['it', 'eng'] }
];


describe('TranslationComponent', () => {
  let tabBS: BehaviorSubject<number>;
  let mockSettingsBS: BehaviorSubject<ISettings>;
  let component: TranslationComponent;

  beforeEach(async () => {
    tabBS = new BehaviorSubject<number>(0);
    mockSettingsBS = new BehaviorSubject<ISettings>(
      { translator: Transaltor.APERTIUM }
    );
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
    mockTabsService.changeTab.mockImplementation(
      (tab: number) => tabBS.next(tab)
    );
    mockTabsService.getCurrentTab.mockReturnValue(
      tabBS.asObservable()
    );
    mockDataService.addTranslation.mockReturnValue(of(undefined));

    if (!('randomUUID' in crypto)) {
      (crypto as any).randomUUID = jest.fn(() => 'mock-uuid');
    }

    component = new TranslationComponent(
      mockApertiumService,
      mockLibreTranslateService,
      mockGoogleTranslateService,
      mockSettingsService,
      mockTabsService,
      mockDataService
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('currentTab$ stream', () => {
    it('should clear the error', () => {
      const sub = subscribeSpyTo(component.error$);
      subscribeSpyTo(component.currentTab$);

      component.errorSubject.next('hello!');
      mockTabsService.changeTab(0);

      expect(sub.getLastValue()).toBe('');
    });

    it('should not clear the error', () => {
      const sub = subscribeSpyTo(component.error$);

      component.errorSubject.next('hello!');
      mockTabsService.changeTab(1);

      expect(sub.getLastValue()).toBe('hello!');
    });
  });

  describe('languages stream', () => {
    it('should populate languages from Apertium', () => {
      subscribeSpyTo(component.languages$);
      mockSettingsBS.next({ translator: Transaltor.APERTIUM });

      expect(mockApertiumService.getLanguages).toHaveBeenCalled();
    });

    it('should get languages from Libretranslate', () => {
      subscribeSpyTo(component.languages$);
      mockSettingsBS.next({ translator: Transaltor.LIBRETRANSLATE });

      expect(mockLibreTranslateService.getLanguages).toHaveBeenCalled();
    });

    it('should get languages from Google', () => {
      subscribeSpyTo(component.languages$);
      mockSettingsBS.next({ translator: Transaltor.GOOGLE });

      expect(mockGoogleTranslateService.getLanguages).toHaveBeenCalled();
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

    it('set targetLanguages to languages if source is auto', () => {
      const sub = subscribeSpyTo(component.targetLanguages$);

      component.targetSubject.next('nld');
      component.sourceSubject.next('auto');

      expect(sub.getLastValue()).toStrictEqual(langList);
    });

    it('should return all languages expect auto for Google Translate', () => {
      const sub = subscribeSpyTo(component.targetLanguages$);
      subscribeSpyTo(mockSettingsService.getSettings());

      mockSettingsService.saveSettings({
        translator: Transaltor.GOOGLE
      });
      const ll = [...langList];
      ll.shift();

      expect(sub.getLastValue()).toStrictEqual(ll);
    });

    it('should unset the target language if source cannot translate to it', () => {
      subscribeSpyTo(component.targetLanguages$);

      component.targetSubject.next('en');
      component.sourceSubject.next('it');

      expect(component.targetSubject.value).toBe('');
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
            expect(res).toStrictEqual({ result: 'Hola', key: expect.any(String), timestamp: expect.stringContaining(':') });
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
            expect(res).toStrictEqual({ result: 'Salve', key: expect.any(String), timestamp: expect.stringContaining(':') });
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

    it('should translate - GoogleTranslate', () => {
      const sub = subscribeSpyTo(component.translate$);

      mockSettingsBS.next({ translator: Transaltor.GOOGLE });
      component.sourceSubject.next('eng');
      component.targetSubject.next('nl');
      component.textToTranslateSubject.next('Hello');
      component.translateSubject.next();

      expect(sub.getLastValue()).toStrictEqual(
        { result: 'Hallo', key: expect.any(String), timestamp: expect.stringContaining(':') }
      );
      expect(mockGoogleTranslateService.translate).toHaveBeenCalled();
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
