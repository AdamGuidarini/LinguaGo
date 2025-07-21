import { Injectable } from '@angular/core';
import { Observable, startWith, Subject } from 'rxjs';
import { ISettings, Transaltor } from '../interfaces/settings-interfaces';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new Subject<ISettings>();
  private settings$: Observable<ISettings> = this.settingsSubject.pipe(
    startWith({ translator: Transaltor.APERTIUM })
  );

  getSettings(): Observable<ISettings> {
    this.settingsSubject.next(JSON.parse(localStorage.getItem('settings') ?? '{}'));

    return this.settings$;
  }

  saveSettings(settings: ISettings): void {
    localStorage.setItem(
      'settings',
      JSON.stringify(settings)
    );

    this.settingsSubject.next(settings);
  }
}
