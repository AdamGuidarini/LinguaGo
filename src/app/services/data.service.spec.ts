/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { lastValueFrom } from 'rxjs';
import { DataService } from './data.service';
import { Transaltor } from '../interfaces/settings-interfaces';

describe('DataService', () => {
  let service: DataService;
  let mockObjectStore: IDBObjectStore;
  let mockTransaction: IDBTransaction;
  let mockDb: IDBDatabase;
  let mockOpenRequest: IDBOpenDBRequest;

  beforeEach(() => {
    mockObjectStore = {
      add: vi.fn(() => {
        const request: any = {};
        setTimeout(() => {
          if (typeof request.onsuccess === 'function') {
            request.onsuccess();
          }
        }, 0);
        return request;
      }),
      count: vi.fn(() => ({ onsuccess: null, onerror: null })),
      getAll: vi.fn(() => ({ onsuccess: null, onerror: null })),
      delete: vi.fn(),
      clear: vi.fn(() => {
        const request: any = {};
        setTimeout(() => {
          if (typeof request.onsuccess === 'function') {
            request.onsuccess();
          }
        }, 0);
        return request;
      })
    } as unknown as IDBObjectStore;

    mockTransaction = {
      objectStore: vi.fn(() => mockObjectStore),
      onerror: null,
    } as unknown as IDBTransaction;

    mockDb = {
      transaction: vi.fn(() => mockTransaction),
      close: vi.fn(),
      createObjectStore: vi.fn(),
      objectStoreNames: { contains: vi.fn() }
    } as unknown as IDBDatabase;

    mockOpenRequest = {
      onsuccess: null,
      onerror: null,
      result: mockDb,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      readyState: 'done',
      error: null,
      source: null,
      transaction: null,
      onupgradeneeded: null
    } as unknown as IDBOpenDBRequest;

    Object.defineProperty(window, 'indexedDB', {
      value: {
        open: vi.fn(() => mockOpenRequest)
      },
      writable: true,
    });

    // Simulate successful DB open
    setTimeout(() => {
      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess({ target: { result: mockDb } } as any);
      }
    }, 0);

    service = new DataService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setUp method', () => {
    it('should define the db', async () => {
      const sub = subscribeSpyTo(service.setUp());

      await sub.onComplete();

      expect(sub.getFirstValue()).toBe(true);
      expect(service.db).toBe(mockDb);
    });

    it('should error if database open fails', async () => {
      const sub = subscribeSpyTo(service.setUp(), { expectErrors: true });

      if (mockOpenRequest.onerror) {
        mockOpenRequest.onerror(new Error('Open failed') as any);
      }

      await sub.onError();

      expect(sub.getError()).toBeDefined();
    });

    it('should not create object store if it exists', async () => {
      mockDb.objectStoreNames.contains = vi.fn(() => true);

      const sub = subscribeSpyTo(service.setUp());

      if (typeof mockOpenRequest.onupgradeneeded === 'function') {
        mockOpenRequest.onupgradeneeded({} as any);
      }

      await sub.onComplete();

      expect(sub.getFirstValue()).toBe(true);
      expect(mockDb.createObjectStore)
        .not
        .toHaveBeenCalled();
    });

    it('should create objectstore if needed', async () => {
      const sub = subscribeSpyTo(service.setUp());

      if (typeof mockOpenRequest.onupgradeneeded === 'function') {
        mockOpenRequest.onupgradeneeded({} as any);
      }

      await sub.onComplete();

      expect(sub.getFirstValue()).toBe(true);
      expect(mockDb.createObjectStore).toHaveBeenCalledWith(
        'translations', { keyPath: 'key' }
      );
    });
  });

  describe('ngOnDestroy method', () => {
    it('should close the db', () => {
      service.db = { close: vi.fn() } as any;

      service.ngOnDestroy();

      expect(service.db?.close).toHaveBeenCalled();
    });

    it('should so nothing if db is undefined', () => {
      service.db = null;

      service.ngOnDestroy();

      expect(mockDb.close).not.toHaveBeenCalled();
    });
  });

  describe('addTranslation method', () => {
    it('should throw an error if db is falsy', () => {
      service.db = null;

      const sub = subscribeSpyTo(service.addTranslation({} as any), { expectErrors: true });

      expect(sub.getError()).toStrictEqual(new Error('DB reference is not defined'));
    });

    it('should add an item to the db', async () => {
      service.db = mockDb;

      const sub = subscribeSpyTo(service.addTranslation(
        {
          target: 'en',
          source: 'it',
          result: 'Hello, world!',
          original: 'Ciao, mondo!',
          translator: Transaltor.APERTIUM
        }
      ));

      await sub.onComplete();

      expect(sub.getValuesLength()).toBe(1);
      expect(mockObjectStore.add).toHaveBeenCalled();
    });

    it('should throw an error if one occurs while adding to db', () => {
      mockObjectStore.add = vi.fn(() => {
        if (typeof mockTransaction.onerror === 'function') {
          mockTransaction.onerror('Oh no!' as any);
        }

        return {} as any;
      });

      service.db = mockDb;

      const sub = subscribeSpyTo(service.addTranslation(
        {
          target: 'en',
          source: 'it',
          result: 'Hello, world!',
          original: 'Ciao, mondo!',
          translator: Transaltor.APERTIUM
        }
      ), { expectErrors: true });

      expect(sub.getError()).toStrictEqual('Oh no!');
    });
  });

  describe('getAllTranslations method', () => {
    it('should return an Observable with the translations - translations first', () => {
      service.db = mockDb;
      const mockGetAllResp = {
        result: [
          {
            target: 'en',
            source: 'it',
            result: 'Hello, world!',
            original: 'Ciao, mondo!'
          }
        ],
        onsuccess: vi.fn()
      };
      const mockCountResp = {
        result: 1,
        onsuccess: vi.fn()
      };

      mockObjectStore.getAll = vi.fn(
        () => mockGetAllResp as any
      );
      mockObjectStore.count = vi.fn(
        () => mockCountResp as any
      );

      const retVal = service.getTranslations();

      const sub = subscribeSpyTo(retVal);

      mockGetAllResp.onsuccess();
      mockCountResp.onsuccess();

      expect(sub.getFirstValue()).toStrictEqual(
        {
          translations: [
            {
              target: 'en',
              source: 'it',
              result: 'Hello, world!',
              original: 'Ciao, mondo!'
            }
          ],
          count: 1
        }
      );
    });

    it('should return an Observable with the translations - count first', () => {
      service.db = mockDb;
      const mockGetAllResp = {
        result: [
          {
            target: 'en',
            source: 'it',
            result: 'Hello, world!',
            original: 'Ciao, mondo!'
          }
        ],
        onsuccess: vi.fn()
      };
      const mockCountResp = {
        result: 1,
        onsuccess: vi.fn()
      };

      mockObjectStore.getAll = vi.fn(
        () => mockGetAllResp as any
      );
      mockObjectStore.count = vi.fn(
        () => mockCountResp as any
      );

      const retVal = service.getTranslations();

      const sub = subscribeSpyTo(retVal);

      mockCountResp.onsuccess();
      mockGetAllResp.onsuccess();

      expect(sub.getFirstValue()).toStrictEqual(
        {
          translations: [
            {
              target: 'en',
              source: 'it',
              result: 'Hello, world!',
              original: 'Ciao, mondo!'
            }
          ],
          count: 1
        }
      );
    });

    it('should throw an error if the transaction fails', () => {
      service.db = mockDb;
      const retVal = service.getTranslations();

      const sub = subscribeSpyTo(retVal, { expectErrors: true });

      if (typeof mockTransaction.onerror === 'function') {
        mockTransaction.onerror(new Error('Oh no!') as any);
      }

      expect(sub.getError()).toStrictEqual(new Error('Oh no!'));
    });

    it('should throw an error if count request fails', () => {
      service.db = mockDb;
      const mockGetAllResp = {
        onerror: vi.fn()
      };
      const mockCountResp = {
        onerror: vi.fn()
      };

      mockObjectStore.getAll = vi.fn(
        () => mockGetAllResp as any
      );
      mockObjectStore.count = vi.fn(
        () => mockCountResp as any
      );

      const retVal = service.getTranslations();

      const sub = subscribeSpyTo(retVal, { expectErrors: true });

      mockCountResp.onerror(
        new Error('Count failed!')
      );

      expect(sub.getError()).toStrictEqual(new Error('Count failed!'));
    });

    it('should throw an error if getAll request fails', () => {
      service.db = mockDb;
      const mockGetAllResp = {
        onerror: vi.fn()
      };
      const mockCountResp = {
        onerror: vi.fn()
      };

      mockObjectStore.getAll = vi.fn(
        () => mockGetAllResp as any
      );
      mockObjectStore.count = vi.fn(
        () => mockCountResp as any
      );

      const retVal = service.getTranslations();

      const sub = subscribeSpyTo(retVal, { expectErrors: true });

      mockGetAllResp.onerror(
        new Error('getAll failed!')
      );

      expect(sub.getError()).toStrictEqual(new Error('getAll failed!'));
    });

    it('should error out if db is falsy', () => {
      service.db = null;

      const retVal = service.getTranslations();

      const sub = subscribeSpyTo(retVal, { expectErrors: true });

      expect(sub.getError()).toStrictEqual(new Error('DB reference is not defined'));
    });
  });

  describe('deleteTranslation method', () => {
    it('should delete the given key', () => {
      service.db = mockDb;

      service.deleteTranslation('foo');

      expect(mockObjectStore.delete).toHaveBeenCalledWith('foo');
    });

    it('should throw an error if transaction fails', () => {
      service.db = mockDb;

      try {
        service.deleteTranslation('foo');

        if (mockTransaction.onerror) {
          mockTransaction.onerror(new Error('Oh no!') as any);
        }
      } catch (e) {
        expect(e).toStrictEqual(
          new Error('Oh no!')
        );
      }
    });

    it('should throw an error if db is null', () => {
      service.db = null;

      expect(() => service.deleteTranslation('foo')).toThrow(
        new Error('Attempted to delete data from undefined database reference')
      );
    });
  });

  describe('deleteAllTranslations method', () => {
    it('should throw an error if db is falsy', () => {
      service.db = null;

      const sub = subscribeSpyTo(service.deleteAllTranslations(), { expectErrors: true });

      expect(sub.getError()).toStrictEqual(new Error('Attempted to delete data from undefined database reference'));
    });

    it('should delete translations', async () => {
      service.db = mockDb;

      await lastValueFrom(service.deleteAllTranslations());

      expect(mockObjectStore.clear).toHaveBeenCalled();
    });

    it('should throw an error if the transaction fails', () => {
      service.db = mockDb;
      const retVal = service.deleteAllTranslations();

      const sub = subscribeSpyTo(retVal, { expectErrors: true });

      if (typeof mockTransaction.onerror === 'function') {
        mockTransaction.onerror(new Error('Oh no!') as any);
      }

      expect(sub.getError()).toStrictEqual(new Error('Oh no!'));
    });

    it('should throw an error if one occurs while deleting to db', () => {
      const clearRequest = { onerror: vi.fn() };

      mockObjectStore.clear = vi.fn(
        () => clearRequest as any
      );

      service.db = mockDb;

      const sub = subscribeSpyTo(service.deleteAllTranslations(), { expectErrors: true });

      clearRequest.onerror(
        new Error('Oh no!')
      );

      expect(sub.getError()).toStrictEqual(new Error('Oh no!'));
    });
  });
});
