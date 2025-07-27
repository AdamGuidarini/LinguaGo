import { Injectable, OnDestroy } from '@angular/core';
import { ITranslation } from '../interfaces/global-transation-interfaces';
import { Observable } from 'rxjs';

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

  setUp(): void {
    const request = window.indexedDB.open(this.databaseName, this.databaseVersion);

    request.onsuccess = () => {
      this.db = request.result;
      this.db.createObjectStore(this.objectStorageName);
    };

    request.onerror = (err: unknown) => {
      console.error(`An error has occurred in database: ${this.databaseName}`, err);

      throw err;
    };
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

    const transaction = this.db.transaction(this.objectStorageName);
    const objectStore = transaction?.objectStore(this.objectStorageName);

    transaction.onerror = (err) => {
      console.error('Error inserting record into indexed db', err, translation);

      throw err;
    };

    objectStore.add(translation, translation.key);
  }

  getTranslations(startIndex: number, batchSize: number): Observable<{ translations: ITranslation[], count: number }> {
    return new Observable((observer) => {
      if (!this.db) {
        const err = new Error('DB reference is not defined');
        console.error(err.message);
        observer.error(err);
        return;
      }

      const transaction = this.db.transaction(this.objectStorageName);
      const objectStore = transaction?.objectStore(this.objectStorageName);

      transaction.onerror = (err) => {
        console.error('Error retrieving records from indexed db', err);
        observer.error(err);
      };

      let translations: ITranslation[] | null = null;
      let count: number | null = null;

      const countRequest = objectStore.count();
      const getAllRequest = objectStore.getAll(
        startIndex, batchSize
      );

      countRequest.onsuccess = () => {
        count = countRequest.result;
        if (translations !== null) {
          observer.next({ translations, count });
          observer.complete();
        }
      };
      countRequest.onerror = (err) => {
        observer.error(err);
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
        observer.error(err);
      };
    });
  }

  deleteTranslation(key: string): void {
    if (!this.db) {
      console.error('DB reference is not defined');

      throw new Error('Attempted to delete data from undefined database reference');
    }

    const transaction = this.db.transaction(this.objectStorageName);
    const objectStore = transaction?.objectStore(this.objectStorageName);

    transaction.onerror = (err) => {
      console.error(`Attempt to delete item with key: ${key} failed!`, err);

      throw err;
    };

    objectStore.delete(key);
  }
}
