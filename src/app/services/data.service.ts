import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { ITranslation } from '../interfaces/global-transation-interfaces';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy {
  constructor() {
    this.setUp();
  }

  private readonly databaseVersion = 1;
  private readonly databaseName = 'translation_history';
  private readonly objectStorageName = 'translations';

  db: IDBDatabase | null = null;

  setUp(): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      const request = window.indexedDB.open(this.databaseName, this.databaseVersion);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.objectStorageName)) {
          db.createObjectStore(this.objectStorageName, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        observer.next(true);
        observer.complete();
      };

      request.onerror = (err: unknown) => {
        console.error(`An error has occurred in database: ${this.databaseName}`, err);
        observer.error(err);
      };
    });
  }

  ngOnDestroy(): void {
    if (this.db) {
      this.db.close();
    }
  }

  addTranslation(translation: ITranslation): void {
    if (!this.db) {
      console.error('DB reference is not defined');

      throw new Error('Attempted to add item when database is null');
    }

    const transaction = this.db.transaction(this.objectStorageName, 'readwrite');
    const objectStore = transaction?.objectStore(this.objectStorageName);

    transaction.onerror = (err) => {
      console.error('Error inserting record into indexed db', err, translation);

      throw err;
    };

    objectStore.add(translation);
  }

  getTranslations(): Observable<{ translations: ITranslation[], count: number }> {
    return new Observable((observer) => {
      if (!this.db) {
        const err = new Error('DB reference is not defined');
        console.error(err.message);
        observer.error(err);
        return;
      }

      const transaction = this.db.transaction(this.objectStorageName, 'readonly');
      const objectStore = transaction?.objectStore(this.objectStorageName);

      transaction.onerror = (err) => {
        console.error('Error retrieving records from indexed db', err);
        observer.error(err);
      };

      let translations: ITranslation[];
      let count: number;

      const countRequest = objectStore.count();
      const getAllRequest = objectStore.getAll();

      countRequest.onsuccess = () => {
        count = countRequest.result;
        if (translations !== null) {
          observer.next({ translations, count });
          observer.complete();
        }
      };
      countRequest.onerror = (err) => {
        observer.error(err);
      };

      getAllRequest.onsuccess = () => {
        translations = getAllRequest.result;
        if (count !== null) {
          observer.next({ translations, count });
          observer.complete();
        }
      };

      getAllRequest.onerror = (err) => {
        observer.error(err);
      };
    });
  }

  deleteTranslation(key: string): void {
    if (!this.db) {
      console.error('DB reference is not defined');

      throw new Error('Attempted to delete data from undefined database reference');
    }

    const transaction = this.db.transaction(this.objectStorageName, 'readwrite');
    const objectStore = transaction?.objectStore(this.objectStorageName);

    transaction.onerror = (err) => {
      console.error(`Attempt to delete item with key: ${key} failed!`, err);

      throw err;
    };

    objectStore.delete(key);
  }

  deleteAllTranslations(): void {
    if (!this.db) {
      console.error('DB reference is not defined');

      throw new Error('Attempted to delete data from undefined database reference');
    }

    const transaction = this.db.transaction(this.objectStorageName, 'readwrite');
    const objectStore = transaction?.objectStore(this.objectStorageName);

    transaction.onerror = (err) => {
      console.error('Attempt to delete all translations from db', err);

      throw err;
    };

    objectStore.clear();
  }
}
