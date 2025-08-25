import { createSpyFromClass } from 'jest-auto-spies';
import { lastValueFrom, of, throwError } from 'rxjs';
import { ITranslation } from '../../interfaces/global-transation-interfaces';
import { DataService } from '../../services/data.service';
import { TabsService } from '../../services/tabs.service';
import { HistoryComponent } from './history.component';

const mockDataService = createSpyFromClass(DataService);
const mockTabsService = createSpyFromClass(TabsService);

describe('HistoryComponent', () => {
  let component: HistoryComponent;

  beforeEach(() => {
    mockTabsService.getCurrentTab.mockReturnValue(of(1));
    mockDataService.setUp.mockReturnValue(of(true));

    component = new HistoryComponent(
      mockDataService,
      mockTabsService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('dbReady$ stream', () => {
    it('should start as false', (done) => {
      component.dbReady$.subscribe(
        (res) => {
          expect(res).toBe(false);
          done();
        }
      );
    });

    it('should be true after setUp', (done) => {
      component.dbReady$.subscribe(
        (res) => {
          expect(res).toBe(true);
          done();
        }
      );
    });

    it('should emit false when setUp throws error (catchError block)', (done) => {
      mockDataService.setUp.mockReturnValueOnce(throwError(() => new Error('setup failed')));
      component = new HistoryComponent(mockDataService, mockTabsService);

      let callCount = 0;
      component.dbReady$.subscribe((value) => {
        callCount++;
        if (callCount === 2) {
          expect(value).toBe(false);
          done();
        }
      });
    });
  });

  describe('translationHistory$ stream', () => {
    it('should get translations', (done) => {
      mockDataService.getTranslations.mockReturnValue(
        of({ translations: [], count: 0 })
      );

      component.translationHistory$.subscribe(
        (res) => {
          expect(res).toStrictEqual(
            { translations: [], count: 0 }
          );
          done();
        }
      );
    });

    it('should not get history if active tab is not 1', () => {
      component.translationHistory$.subscribe();

      mockTabsService.getCurrentTab.mockReturnValueOnce(of(0));
      mockDataService.getTranslations.mockClear();

      expect(mockDataService.getTranslations).not.toHaveBeenCalled();
    });
  });

  describe('deleteTranslation$ stream', () => {
    it('should not delete if no key is provided', () => {
      component.deleteTranslation$.subscribe();
      component.deleteTranslationSubject.next(
        { key: undefined } as ITranslation
      );

      expect(mockDataService.deleteTranslation).not.toHaveBeenCalled();
    });

    it('should delete the translation if provided', async () => {
      component.deleteTranslation$.subscribe();
      component.deleteTranslationSubject.next(
        { key: 'foo' } as ITranslation
      );

      expect(mockDataService.deleteTranslation).toHaveBeenCalledWith(
        'foo'
      );
    });
  });

  describe('vm$ stream', () => {
    it('should map translationHistory$', async () => {
      const res = await lastValueFrom(component.vm$);

      expect(Object.keys(res)).toStrictEqual(
        ['translationHistory']
      );
    });
  });
});
