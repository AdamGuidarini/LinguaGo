/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;
  let mockObjectStore: IDBObjectStore;
  let mockTransaction: IDBTransaction;
  let mockDb: IDBDatabase;

  beforeEach(() => {
    mockObjectStore = {
      add: jest.fn(),
      count: jest.fn(() => ({ onsuccess: null, onerror: null })),
      getAll: jest.fn(() => ({ onsuccess: null, onerror: null })),
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

    const mockOpenRequest = {
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

  describe('ngOnDestroy method', () => {
    it('should close the db', () => {
      service.db = { close: jest.fn() } as any;

      service.ngOnDestroy();

      expect(service.db?.close).toHaveBeenCalled();
    });
  });
});
