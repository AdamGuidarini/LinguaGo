import { Injectable, OnInit } from '@angular/core';
import { ISettings, Transaltor } from '../interfaces/settings-interfaces';

@Injectable({
  providedIn: 'root'
})
export class SettingsService implements OnInit {
  private settings: ISettings = {
    translator: Transaltor.APERTIUM
  };

  ngOnInit(): void {
    this.settings = this.getSettings();
  }

  getSettings(): ISettings {
    this.settings = JSON.parse(localStorage.getItem('settings') ?? '{}');

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
