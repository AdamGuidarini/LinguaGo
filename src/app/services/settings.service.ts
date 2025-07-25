import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISettings, Transaltor } from '../interfaces/settings-interfaces';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly defaultSettings: ISettings = { translator: Transaltor.APERTIUM };

  private readonly settingsSubject = new BehaviorSubject<ISettings>(
    JSON.parse(localStorage.getItem('settings') ?? 'null') || this.defaultSettings
  );

  getSettings(): Observable<ISettings> {
    return this.settingsSubject.asObservable();
  }

  saveSettings(settings: ISettings): void {
    localStorage.setItem('settings', JSON.stringify(settings));
    this.settingsSubject.next(settings);
  }
}
