/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { mock } from 'vitest-mock-extended';
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

const mockApertiumService = mock<ApertiumService>();
const mockLibreTranslateService = mock<LibreTranslateService>();
const mockGoogleTranslateService = mock<GoogleTranslateService>();
const mockSettingsService = mock<SettingsService>();
const mockTabsService = mock<TabsService>();
const mockDataService = mock<DataService>();

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
      (crypto as any).randomUUID = vi.fn(() => 'mock-uuid');
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
    vi.clearAllMocks();
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

    it('should log if it cannot retrieve languages', () => {
      mockApertiumService.getLanguages.mockReturnValue(
        throwError(() => new Error('Oh no!'))
      );

      const sub = subscribeSpyTo(component.languages$.pipe(
        take(1)
      ));

      mockSettingsBS.next({ translator: Transaltor.APERTIUM });

      expect(sub.getFirstValue()).toStrictEqual([]);
    });
  });

  describe('source$ stream', () => {
    it('should set the source language', () => {
      component.sourceSubject.next('eng');

      const sub = subscribeSpyTo(component.source$);

      expect(sub.getFirstValue()).toBe('eng');
    });
  });

  describe('target$ stream', () => {
    it('should set the target language', () => {
      component.targetSubject.next('nld');

      const sub = subscribeSpyTo(component.target$);

      expect(sub.getFirstValue()).toBe('nld');
    });
  });

  describe('targetLanguages$ stream', () => {
    it('should filter out languages the source cannot target', () => {
      const sub = subscribeSpyTo(component.targetLanguages$);

      mockSettingsBS.next({ translator: Transaltor.APERTIUM });
      component.sourceSubject.next('eng');

      expect(sub.getValues().find((res) => res.length > 0)).toStrictEqual([
        { code: 'spa', name: 'Spanish', targets: ['it', 'eng'] }
      ]);
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

    it('should translate - Apertium', () => {
      const sub = subscribeSpyTo(component.translate$);

      mockSettingsBS.next({ translator: Transaltor.APERTIUM });

      component.sourceSubject.next('eng');
      component.targetSubject.next('spa');
      component.textToTranslateSubject.next('Hello');
      component.translateSubject.next();

      expect(sub.getValues().find((res) => res)).toStrictEqual({ result: 'Hola', key: expect.any(String), timestamp: expect.stringContaining(':') });
      expect(mockApertiumService.translate).toHaveBeenCalled();
    });

    it('should translate - LibreTranslate', () => {
      const sub = subscribeSpyTo(component.translate$);

      mockSettingsBS.next({ translator: Transaltor.LIBRETRANSLATE });
      component.sourceSubject.next('eng');
      component.targetSubject.next('it');
      component.textToTranslateSubject.next('Hello');
      component.translateSubject.next();

      expect(sub.getValues().find((res) => res)).toStrictEqual({ result: 'Salve', key: expect.any(String), timestamp: expect.stringContaining(':') });
      expect(mockLibreTranslateService.translate).toHaveBeenCalled();
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

    it('should set an error if one occurs', () => {
      subscribeSpyTo(component.translate$);
      const sub = subscribeSpyTo(component.error$);

      mockSettingsBS.next({ translator: Transaltor.APERTIUM });
      mockApertiumService.translate.mockReturnValueOnce(
        throwError(() => new Error('Oh no!'))
      );

      component.sourceSubject.next('eng');
      component.targetSubject.next('nl');
      component.textToTranslateSubject.next('Hello');
      component.translateSubject.next();

      expect(sub.getLastValue()).toBe('Translation failed with error: Oh no!');
    });
  });

  describe('vm$ stream', () => {
    it('should map the stream', async () => {
      const res = await firstValueFrom(component.vm$);

      expect(Object.keys(res).length).toBe(9);
    });
  });
});
