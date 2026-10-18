/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mock } from 'vitest-mock-extended';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { lastValueFrom, of } from 'rxjs';
import { Transaltor } from '../../interfaces/settings-interfaces';
import { DataService } from '../../services/data.service';
import { SettingsService } from '../../services/settings.service';
import { SettingsComponent } from './settings.component';
import { TranslocoService } from "@jsverse/transloco";

const mockSettingsService = mock<SettingsService>();
const mockDataService = mock<DataService>();
const mockTransloco = mock<TranslocoService>();

describe('SettingsComponent', () => {
  let component: SettingsComponent;

  beforeEach(() => {
    mockSettingsService.getSettings.mockReturnValue(
      of({
        translator: Transaltor.APERTIUM
      })
    );
    mockTransloco.translate.mockImplementation(
      (key) => key 
    );

    component = new SettingsComponent(
      mockSettingsService,
      mockDataService,
      mockTransloco
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('settings$ stream', () => {
    it('should get settings', () => {
      const sub = subscribeSpyTo(component.settings$);

      expect(sub.getFirstValue()).toStrictEqual({
        translator: Transaltor.APERTIUM
      });
    });
  });

  describe('selectedTranslator stream', () => {
    it('should update the selected translator', () => {
      const sub = subscribeSpyTo(component.selectedTranslator$);

      component.selectedTranslatorSubject.next(
        Transaltor.GOOGLE
      );

      expect(sub.getLastValue()).toBe(Transaltor.GOOGLE);
      expect(mockSettingsService.saveSettings).toHaveBeenLastCalledWith(
        { translator: Transaltor.GOOGLE }
      );
    });

    describe('libreTranslateUrl$ stream', () => {
      it('should set the URL', () => {
        const sub = subscribeSpyTo(component.libreTranslateUrl$);

        component.libreTranslateUrlSubject.next(
          'https://foo.com'
        );

        expect(sub.getLastValue()).toBe('https://foo.com');
      });

      it('should not update the URL if it has not changed', () => {
        mockSettingsService.saveSettings.mockClear();

        const sub = subscribeSpyTo(component.libreTranslateUrl$);

        component.libreTranslateUrlSubject.next('https://foo.com');

        expect(mockSettingsService.saveSettings)
          .toHaveBeenCalledTimes(1);
        expect(sub.getValueAt(1)).toBe('https://foo.com');

        component.libreTranslateUrlSubject.next('https://foo.com');
      });
    });
  });

  describe('libreTranslateKey$ stream', () => {
    it('should update the key', () => {
      const sub = subscribeSpyTo(component.libreTranslateKey$);

      component.libreTranslateKeySubject.next(
        'hello'
      );

      expect(sub.getLastValue()).toBe('hello');
    });

    it('should not update the key if it has not changed', () => {
      mockSettingsService.saveSettings.mockClear();

      subscribeSpyTo(component.libreTranslateKey$);

      component.libreTranslateKeySubject.next('foo');

      expect(mockSettingsService.saveSettings)
        .toHaveBeenCalledTimes(1);

      component.libreTranslateKeySubject.next('foo');
    });
  });

  describe('importClick$ stream', () => {
    it('should open the warning dialog', () => {
      component.showDialog = vi.fn(() => of(true));

      component.importClick$.subscribe(
        () => {
          expect(
            component.showDialog
          ).toHaveBeenCalledWith(
            'Settings.Warning',
            'Settings.Importing data will delete all existing data, do you want to continue?'
          );
        }
      );

      component.importClickTrigger.next();
    });

    it('should click on the file picker', () => {
      const filePicker = { click: vi.fn() } as any;

      component.showDialog = vi.fn(() => of(true));
      document.getElementById = vi.fn(
        () => filePicker
      );

      component.importClick$.subscribe();
      component.importClickTrigger.next();

      expect(filePicker.click).toHaveBeenCalled();
    });
  });

  describe('importData$ stream', () => {
    beforeEach(() => {
      mockDataService.deleteAllTranslations.mockReturnValue(of(undefined));
      mockDataService.addTranslation.mockReturnValue(of(undefined));
    });

    it('should  not delete translations if no file is give', () => {
      const sub = subscribeSpyTo(component.importData$);

      component.importDataSubject.next({ target: null } as any);

      expect(sub.getValuesLength()).toBe(1);
      expect(mockDataService.deleteAllTranslations).not.toHaveBeenCalled();
    });

    it('should read the data', async () => {
      const sub = subscribeSpyTo(component.importData$);

      component.importDataSubject.next({
        target: {
          files: [{ text: () => lastValueFrom(of('[{ "foo": "bar" }]')) }]
        } as any
      } as any);

      await vi.waitFor(() => expect(sub.getValuesLength()).toBe(1));

      expect(mockDataService.addTranslation).toHaveBeenCalledWith(
        { foo: 'bar' }
      );
    });
  });

  describe('exportData$ stream', () => {
    it('should download the data', () => {
      mockDataService.getTranslations.mockReturnValue(
        of([{ foo: 'bar' }] as any)
      );
      const link = { setAttribute: vi.fn(), style: { visibility: '' }, click: vi.fn() } as any;
      document.createElement = vi.fn(
        () => link
      );
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
      URL.createObjectURL = vi.fn(() => '');

      const sub = subscribeSpyTo(component.exportData$);
      component.exportDataSubject.next();

      expect(sub.getValuesLength()).toBe(1);
      expect(link.setAttribute).toHaveBeenCalledWith(
        'download',
        expect.stringContaining('linguago_')
      );
    });
  });

  describe('deleteAll$ stream', () => {
    beforeEach(() => {
      mockDataService.deleteAllTranslations.mockReturnValue(
        of(undefined)
      );
    });

    it('should delete translations if user accepts', () => {
      component.showDialog = vi.fn(() => of(true));

      const sub = subscribeSpyTo(component.deleteAll$);

      component.deleteAllSubject.next();

      expect(sub.getValuesLength()).toBe(1);
      expect(mockDataService.deleteAllTranslations).toHaveBeenCalled();
    });
  });

  describe('vm$ stream', () => {
    it('should collect streams', () => {
      const sub = subscribeSpyTo(component.vm$);

      expect(Object.keys(sub.getFirstValue())).toStrictEqual(
        [
          'selectedTranslator',
          'libreTranslateUrl',
          'libreTranslateKey',
          'settings',
          'firstSettings'
        ]
      );
    });

    describe('showDialog', () => {
      let confirmationDialogMock: any;
      let nativeElementMock: any;
      let titleElem: any;
      let messageElem: any;
      let cancelElem: any;
      let acceptElem: any;

      beforeEach(() => {
      // Mock dialog and DOM elements
      nativeElementMock = {
        showModal: vi.fn(),
        close: vi.fn()
      };
      confirmationDialogMock = { nativeElement: nativeElementMock };
      component.confirmationDialog = confirmationDialogMock;

      titleElem = { textContent: '', id: 'title' };
      messageElem = { textContent: '', id: 'message' };
      cancelElem = { addEventListener: vi.fn(), id: 'cancel' };
      acceptElem = { addEventListener: vi.fn(), id: 'accept' };

      vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        switch (id) {
        case 'title': return titleElem;
        case 'message': return messageElem;
        case 'cancel': return cancelElem;
        case 'accept': return acceptElem;
        default: return null;
        }
      });
      });

      afterEach(() => {
      vi.restoreAllMocks();
      });

      it('should throw if confirmationDialog is not set', () => {
      component.confirmationDialog = undefined;
      const sub = subscribeSpyTo(component.showDialog('Title', 'Message'), { expectErrors: true });
      expect(sub.getError()).toBe('Could not bind confirmation dialog');
      });

      it('should set dialog title and message', () => {
      component.showDialog('Dialog Title', 'Dialog Message').subscribe();
      expect(titleElem.textContent).toBe('Dialog Title');
      expect(messageElem.textContent).toBe('Dialog Message');
      expect(nativeElementMock.showModal).toHaveBeenCalled();
      });

      it('should error if title or message element is missing', () => {
      vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        if (id === 'title') return null;
        if (id === 'message') return messageElem;
        if (id === 'cancel') return cancelElem;
        if (id === 'accept') return acceptElem;
        return null;
      });
      const sub = subscribeSpyTo(component.showDialog('Title', 'Message'), { expectErrors: true });
      expect(sub.getError()).toBe('Could not bind title or message elements in dialog');
      });

      it('should error if cancel or accept element is missing', () => {
      vi.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        if (id === 'title') return titleElem;
        if (id === 'message') return messageElem;
        if (id === 'cancel') return null;
        if (id === 'accept') return acceptElem;
        return null;
      });
      const sub = subscribeSpyTo(component.showDialog('Title', 'Message'), { expectErrors: true });
      expect(sub.getError()).toBe('Could not bind cancel or accept elements in dialog');
      });

      it('should emit true and close dialog when accept is clicked', () => {
      let acceptHandler: any;
      acceptElem.addEventListener = vi.fn((event, handler) => {
        if (event === 'click') acceptHandler = handler;
      });
      cancelElem.addEventListener = vi.fn();

      const sub = subscribeSpyTo(component.showDialog('Title', 'Message'));

      // Simulate accept click
      acceptHandler();

      expect(sub.getFirstValue()).toBe(true);
      expect(nativeElementMock.close).toHaveBeenCalled();
      });

      it('should emit false and close dialog when cancel is clicked', () => {
      let cancelHandler: any;
      acceptElem.addEventListener = vi.fn();
      cancelElem.addEventListener = vi.fn((event, handler) => {
        if (event === 'click') cancelHandler = handler;
      });

      const sub = subscribeSpyTo(component.showDialog('Title', 'Message'));

      // Simulate cancel click
      cancelHandler();

      expect(sub.getFirstValue()).toBe(false);
      expect(nativeElementMock.close).toHaveBeenCalled();
      });
    });
  });
});
