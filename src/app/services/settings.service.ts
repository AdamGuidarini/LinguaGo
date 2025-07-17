import { Injectable, OnInit } from '@angular/core';
import { ISettings } from '../interfaces/settings-interfaces';

@Injectable({
  providedIn: 'root'
})
export class SettingsService implements OnInit {

  constructor() { }

  private settings: ISettings = {
    translator: 'apertium'
  };

  ngOnInit(): void {
    this.settings = this.getSettings();
  }

  getSettings(): ISettings {
    return this.settings;
  }

  saveSettings(settings: ISettings): void {
    localStorage.setItem(
      'settings',
      JSON.stringify(settings)
    );

    this.settings = settings;
  }
}
