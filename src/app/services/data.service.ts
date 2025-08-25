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

  addTranslation(translation: ITranslation): Observable<void> {
    return new Observable<void>((observer) => {
      if (!this.db) {
        observer.error(new Error('DB reference is not defined'));
        return;
      }

      const transaction = this.db.transaction(this.objectStorageName, 'readwrite');
      const objectStore = transaction.objectStore(this.objectStorageName);

      transaction.onerror = (err) => observer.error(err);

      const request = objectStore.add(translation);

      request.onsuccess = () => {
        observer.next();
        observer.complete();
      };

      request.onerror = (err) => observer.error(err);
    });
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

      const tryComplete = () => {
        if (translations && (count || count === 0)) {
          observer.next({ translations, count });
          observer.complete();
        }
      };

      countRequest.onsuccess = () => {
        count = countRequest.result;
        tryComplete();
      };

      getAllRequest.onsuccess = () => {
        translations = getAllRequest.result;
        tryComplete();
      };

      countRequest.onerror = (err) => observer.error(err);
      getAllRequest.onerror = (err) => observer.error(err);
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
