/* eslint-disable @typescript-eslint/no-explicit-any */
import { catchError } from 'rxjs';
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let mockObjectStore: IDBObjectStore;
  let mockTransaction: IDBTransaction;
  let mockDb: IDBDatabase;
  let mockOpenRequest: IDBOpenDBRequest;

  beforeEach(() => {
    mockObjectStore = {
      add: jest.fn(),
      count: jest.fn(() => ({ onsuccess: null, onerror: null })),
      getAll: jest.fn(() => ({ onsuccess: null, onerror: null })),
      delete: jest.fn(),
      clear: jest.fn()
    } as unknown as IDBObjectStore;

    mockTransaction = {
      objectStore: jest.fn(() => mockObjectStore),
      onerror: null,
    } as unknown as IDBTransaction;

    mockDb = {
      transaction: jest.fn(() => mockTransaction),
      close: jest.fn(),
      createObjectStore: jest.fn(),
    } as unknown as IDBDatabase;

    mockOpenRequest = {
      onsuccess: null,
      onerror: null,
      result: mockDb,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      readyState: 'done',
      error: null,
      source: null,
      transaction: null,
    } as unknown as IDBOpenDBRequest;

    Object.defineProperty(window, 'indexedDB', {
      value: {
        open: jest.fn(() => mockOpenRequest)
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
    it('should define the db', () => {
      service.setUp();

      if (mockOpenRequest.onsuccess) {
        mockOpenRequest.onsuccess({} as any);
      }

      expect(service.db).toBe(mockDb);
    });

    it('should throw an error if request fails', () => {
      service.setUp();

      expect(() => {
        if (mockOpenRequest.onerror) {
          mockOpenRequest.onerror(new Error('Oh no!') as any);
        }
      }).toThrow(
        'Oh no!'
      );
    });
  });

  describe('ngOnDestroy method', () => {
    it('should close the db', () => {
      service.db = { close: jest.fn() } as any;

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

      expect(() => service.addTranslation({} as any)).toThrow(
        'Attempted to add item when database is null'
      );
    });

    it('should add an item to the db', () => {
      service.db = mockDb;

      service.addTranslation(
        {
          target: 'en',
          source: 'it',
          result: 'Hello, world!',
          original: 'Ciao, mondo!'
        }
      );

      expect(mockObjectStore.add).toHaveBeenCalled();
    });

    it('should throw an error if one occurs while adding to db', () => {
      mockObjectStore.add = jest.fn(() => {
        if (typeof mockTransaction.onerror === 'function') {
          mockTransaction.onerror('Oh no!' as any);
        }

        return {} as any;
      });

      service.db = mockDb;

      expect(() => service.addTranslation(
        {
          target: 'en',
          source: 'it',
          result: 'Hello, world!',
          original: 'Ciao, mondo!'
        }
      )).toThrow('Oh no!');
    });
  });

  describe('getAllTranslations method', () => {
    it('should return an Observable with the translations - translations first', (done) => {
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
        onsuccess: jest.fn()
      };
      const mockCountResp = {
        result: 1,
        onsuccess: jest.fn()
      };

      mockObjectStore.getAll = jest.fn(
        () => mockGetAllResp as any
      );
      mockObjectStore.count = jest.fn(
        () => mockCountResp as any
      );

      const retVal = service.getTranslations();

      retVal.subscribe(
        (res) => {
          expect(res).toStrictEqual(
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
          done();
        }
      );

      mockGetAllResp.onsuccess();
      mockCountResp.onsuccess();
    });

    it('should return an Observable with the translations - count first', (done) => {
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
        onsuccess: jest.fn()
      };
      const mockCountResp = {
        result: 1,
        onsuccess: jest.fn()
      };

      mockObjectStore.getAll = jest.fn(
        () => mockGetAllResp as any
      );
      mockObjectStore.count = jest.fn(
        () => mockCountResp as any
      );

      const retVal = service.getTranslations();

      retVal.subscribe(
        (res) => {
          expect(res).toStrictEqual(
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
          done();
        }
      );

      mockCountResp.onsuccess();
      mockGetAllResp.onsuccess();
    });

    it('should throw an error if the transaction fails', (done) => {
      service.db = mockDb;
      const retVal = service.getTranslations();

      retVal.pipe(
        catchError((err) => {
          expect(err).toStrictEqual(new Error('Oh no!'));
          done();

          return [];
        })
      ).subscribe();

      if (typeof mockTransaction.onerror === 'function') {
        mockTransaction.onerror(new Error('Oh no!') as any);
      }
    });

    it('should throw an error if count request fails', (done) => {
      service.db = mockDb;
      const mockGetAllResp = {
        onerror: jest.fn()
      };
      const mockCountResp = {
        onerror: jest.fn()
      };

      mockObjectStore.getAll = jest.fn(
        () => mockGetAllResp as any
      );
      mockObjectStore.count = jest.fn(
        () => mockCountResp as any
      );

      const retVal = service.getTranslations();

      retVal.pipe(
        catchError((err) => {
          expect(err).toStrictEqual(new Error('Count failed!'));
          done();

          return [];
        })
      ).subscribe();

      mockCountResp.onerror(
        new Error('Count failed!')
      );
    });

    it('should throw an error if getAll request fails', (done) => {
      service.db = mockDb;
      const mockGetAllResp = {
        onerror: jest.fn()
      };
      const mockCountResp = {
        onerror: jest.fn()
      };

      mockObjectStore.getAll = jest.fn(
        () => mockGetAllResp as any
      );
      mockObjectStore.count = jest.fn(
        () => mockCountResp as any
      );

      const retVal = service.getTranslations();

      retVal.pipe(
        catchError((err) => {
          expect(err).toStrictEqual(new Error('getAll failed!'));
          done();

          return [];
        })
      ).subscribe();

      mockGetAllResp.onerror(
        new Error('getAll failed!')
      );
    });

    it('should error out if db is falsy', (done) => {
      service.db = null;

      const retVal = service.getTranslations();

      retVal.pipe(
        catchError((err) => {
          expect(err).toStrictEqual(
            new Error('DB reference is not defined')
          );
          done();

          return [];
        })
      ).subscribe();
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
    it('should delete translations', () => {
      service.db = mockDb;

      service.deleteAllTranslations();

      expect(mockObjectStore.clear).toHaveBeenCalled();
    });

    it('should throw an error if one occurs while deleteing', () => {
      service.db = mockDb;

      try {
        service.deleteAllTranslations();

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
});
