import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { DateTime } from 'luxon';
import { BehaviorSubject, combineLatest, EMPTY, from, map, Observable, startWith, Subject, switchMap, take, tap, withLatestFrom } from 'rxjs';
import { Transaltor } from '../../interfaces/settings-interfaces';
import { DataService } from '../../services/data.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatCard,
    MatFormFieldModule,
    MatRadioModule,
    FlexLayoutModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    MatButtonModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  constructor(
    private settingsService: SettingsService,
    private dataService: DataService
  ) { }

  settings$ = this.settingsService.getSettings();
  firstSettings$ = this.settings$.pipe(
    take(1),
    tap((settings) => this.selectedTranslatorSubject.next(settings.translator))
  );

  selectedTranslatorSubject = new BehaviorSubject<string>('');
  selectedTranslator$: Observable<Transaltor> = combineLatest([
    this.selectedTranslatorSubject, this.settings$
  ]).pipe(
    map(([choice, settings]) => {
      if (choice && choice !== settings.translator) {
        this.settingsService.saveSettings(
          { ...settings, translator: choice as Transaltor }
        );
      }

      return choice as Transaltor;
    })
  );

  libreTranslateUrlSubject = new Subject<string>();
  libreTranslateUrl$: Observable<string> = this.libreTranslateUrlSubject.pipe(
    withLatestFrom(this.settings$),
    map(([url, settings]) => {
      if (settings.libreTranslateUrl !== url) {
        this.settingsService.saveSettings(
          {
            ...settings,
            libreTranslateUrl: url
          }
        );
      }

      return url;
    }),
    startWith('')
  );

  libreTranslateKeySubject = new Subject<string>();
  libreTranslateKey$ = this.libreTranslateKeySubject.pipe(
    withLatestFrom(this.settings$),
    map(([key, settings]) => {
      if (settings.libreTranslateUrl !== key) {
        this.settingsService.saveSettings(
          {
            ...settings,
            libreTranslateKey: key
          }
        );
      }

      return key;
    }),
    startWith('')
  );

  importDataSubject = new Subject<Event>();
  importData$ = this.importDataSubject.pipe(
    switchMap((ev) => {
      const input = ev.target as HTMLInputElement | null;
      const file = input?.files && input.files.length > 0 ? input.files[0] : null;

      if (file) {
        return from(file.text()).pipe(
          tap((t) => {
            const data = JSON.parse(t);

            console.log(data);
          })
        );
      }

      return EMPTY;
    })
  );

  exportDataSubject = new Subject<void>();
  exportData$ = this.exportDataSubject.pipe(
    switchMap(() => this.dataService.getTranslations()),
    tap((data) => {
      const now = DateTime.now();
      const blob = new Blob(
        [JSON.stringify(data.translations)]
      );

      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `linguago_${now.year}-${now.month}-${now.day}-${now.hour}-${now.minute}-${now.second}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
  );

  deleteAllSubject = new Subject<void>();
  deleteAll$ = this.deleteAllSubject.pipe(
    tap(() => this.dataService.deleteAllTranslations())
  );

  vm$ = combineLatest([
    this.selectedTranslator$,
    this.libreTranslateUrl$,
    this.libreTranslateKey$,
    this.settings$,
    this.firstSettings$
  ]).pipe(
    map(([
      selectedTranslator,
      libreTranslateUrl,
      libreTranslateKey,
      settings,
      firstSettings
    ]) => ({
      selectedTranslator,
      libreTranslateUrl,
      libreTranslateKey,
      settings,
      firstSettings
    }))
  );

  triggers$ = combineLatest([
    this.importData$,
    this.exportData$,
    this.deleteAll$
  ]);
}
