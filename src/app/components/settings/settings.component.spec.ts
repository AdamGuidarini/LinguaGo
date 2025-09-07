/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSpyFromClass } from 'jest-auto-spies';
import { lastValueFrom, of } from 'rxjs';
import { Transaltor } from '../../interfaces/settings-interfaces';
import { DataService } from '../../services/data.service';
import { SettingsService } from '../../services/settings.service';
import { SettingsComponent } from './settings.component';

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

  describe('importClick$ stream', () => {
    it('should open the warning dialog', () => {
      component.importClick$.subscribe(
        () => {
          expect(
            component.showDialog
          ).toHaveBeenCalledWith(
            'Warning!',
            'Importing data will delete all existing data, do you want to continue?'
          );
        }
      );

      component.importClickTrigger.next();
    });

    it('should click on the file picker', () => {
      const filePicker = { click: jest.fn() } as any;

      component.showDialog = jest.fn(() => of(true));
      document.getElementById = jest.fn(
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

    it('should  not delete translations if no file is give', (done) => {
      component.importData$.subscribe(
        () => {
          expect(mockDataService.deleteAllTranslations).not.toHaveBeenCalled();
          done();
        }
      );
      component.importDataSubject.next({ target: null } as any);
    });

    it('should read the data', (done) => {
      component.importData$.subscribe(
        () => {
          expect(mockDataService.addTranslation).toHaveBeenCalledWith(
            { foo: 'bar' }
          );
          done();
        }
      );
      component.importDataSubject.next({
        target: {
          files: [{ text: () => lastValueFrom(of('[{ "foo": "bar" }]')) }]
        } as any
      } as any);
    });
  });

  describe('exportData$ stream', () => {
    it('should download the data', (done) => {
      mockDataService.getTranslations.mockReturnValue(
        of([{ foo: 'bar' }] as any)
      );
      const link = { setAttribute: jest.fn(), style: { visibility: '' }, click: jest.fn() } as any;
      document.createElement = jest.fn(
        () => link
      );
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();
      URL.createObjectURL = jest.fn(() => '');

      component.exportData$.subscribe(
        () => {
          expect(link.setAttribute).toHaveBeenCalledWith(
            'download',
            expect.stringContaining('linguago_')
          );
          done();
        }
      );
      component.exportDataSubject.next();
    });
  });

  describe('deleteAll$ stream', () => {
    beforeEach(() => {
      mockDataService.deleteAllTranslations.mockReturnValue(
        of(undefined)
      );
    });

    it('should delete translations if user accepts', (done) => {
      component.showDialog = jest.fn(() => of(true));

      component.deleteAll$.subscribe(
        () => {
          expect(mockDataService.deleteAllTranslations).toHaveBeenCalled();
          done();
        }
      );

      component.deleteAllSubject.next();
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
              'settings',
              'firstSettings'
            ]
          );
          done();
        }
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
        showModal: jest.fn(),
        close: jest.fn()
      };
      confirmationDialogMock = { nativeElement: nativeElementMock };
      component.confirmationDialog = confirmationDialogMock;

      titleElem = { textContent: '', id: 'title' };
      messageElem = { textContent: '', id: 'message' };
      cancelElem = { addEventListener: jest.fn(), id: 'cancel' };
      acceptElem = { addEventListener: jest.fn(), id: 'accept' };

      jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
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
      jest.restoreAllMocks();
      });

      it('should throw if confirmationDialog is not set', (done) => {
      component.confirmationDialog = undefined;
      component.showDialog('Title', 'Message').subscribe({
        error: (err) => {
        expect(err).toBe('Could not bind confirmation dialog');
        done();
        }
      });
      });

      it('should set dialog title and message', () => {
      component.showDialog('Dialog Title', 'Dialog Message').subscribe();
      expect(titleElem.textContent).toBe('Dialog Title');
      expect(messageElem.textContent).toBe('Dialog Message');
      expect(nativeElementMock.showModal).toHaveBeenCalled();
      });

      it('should error if title or message element is missing', (done) => {
      jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        if (id === 'title') return null;
        if (id === 'message') return messageElem;
        if (id === 'cancel') return cancelElem;
        if (id === 'accept') return acceptElem;
        return null;
      });
      component.showDialog('Title', 'Message').subscribe({
        error: (err) => {
        expect(err).toBe('Could not bind title or message elements in dialog');
        done();
        }
      });
      });

      it('should error if cancel or accept element is missing', (done) => {
      jest.spyOn(document, 'getElementById').mockImplementation((id: string) => {
        if (id === 'title') return titleElem;
        if (id === 'message') return messageElem;
        if (id === 'cancel') return null;
        if (id === 'accept') return acceptElem;
        return null;
      });
      component.showDialog('Title', 'Message').subscribe({
        error: (err) => {
        expect(err).toBe('Could not bind cancel or accept elements in dialog');
        done();
        }
      });
      });

      it('should emit true and close dialog when accept is clicked', (done) => {
      let acceptHandler: any;
      acceptElem.addEventListener = jest.fn((event, handler) => {
        if (event === 'click') acceptHandler = handler;
      });
      cancelElem.addEventListener = jest.fn();

      component.showDialog('Title', 'Message').subscribe((result) => {
        expect(result).toBe(true);
        expect(nativeElementMock.close).toHaveBeenCalled();
        done();
      });

      // Simulate accept click
      acceptHandler();
      });

      it('should emit false and close dialog when cancel is clicked', (done) => {
      let cancelHandler: any;
      acceptElem.addEventListener = jest.fn();
      cancelElem.addEventListener = jest.fn((event, handler) => {
        if (event === 'click') cancelHandler = handler;
      });

      component.showDialog('Title', 'Message').subscribe((result) => {
        expect(result).toBe(false);
        expect(nativeElementMock.close).toHaveBeenCalled();
        done();
      });

      // Simulate cancel click
      cancelHandler();
      });
    });
  });
});
