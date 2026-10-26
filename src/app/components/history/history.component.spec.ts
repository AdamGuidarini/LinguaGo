import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { beforeEach, describe, expect, it } from 'vitest';
import { mock } from 'vitest-mock-extended';
import { lastValueFrom, of, throwError } from 'rxjs';
import { ITranslation } from '../../interfaces/global-transation-interfaces';
import { DataService } from '../../services/data.service';
import { TabsService } from '../../services/tabs.service';
import { HistoryComponent } from './history.component';

const mockDataService = mock<DataService>();
const mockTabsService = mock<TabsService>();

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
    it('should start as false', () => {
      const sub = subscribeSpyTo(component.dbReady$);

      expect(sub.getFirstValue()).toBe(false);
    });

    it('should be true after setUp', () => {
      const sub = subscribeSpyTo(component.dbReady$);

      expect(sub.getLastValue()).toBe(true);
    });

    it('should emit false when setUp throws error (catchError block)', () => {
      mockDataService.setUp.mockReturnValueOnce(throwError(() => new Error('setup failed')));
      component = new HistoryComponent(mockDataService, mockTabsService);

      const sub = subscribeSpyTo(component.dbReady$);

      expect(sub.getValueAt(1)).toBe(false);
    });
  });

  describe('translationHistory$ stream', () => {
    it('should get translations', () => {
      mockDataService.getTranslations.mockReturnValue(
        of({ translations: [], count: 0 })
      );

      const sub = subscribeSpyTo(component.translationHistory$);

      expect(sub.getFirstValue()).toStrictEqual(
        { translations: [], count: 0 }
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
