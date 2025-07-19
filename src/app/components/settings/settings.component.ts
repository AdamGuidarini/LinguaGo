import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { BehaviorSubject, combineLatest, map, Observable, startWith, Subject, withLatestFrom } from 'rxjs';
import { ISettings, Transaltor } from '../../interfaces/settings-interfaces';
import { SettingsService } from '../../services/settings.service';
import { MatButtonModule } from '@angular/material/button';

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
    private settingsService: SettingsService
  ) { }

  settingsSubject = new BehaviorSubject<ISettings>(this.settingsService.getSettings());
  settings$ = this.settingsSubject.pipe();

  selectedTranslatorSubject = new Subject<string>();
  selectedTranslator$: Observable<Transaltor> = this.selectedTranslatorSubject
    .pipe(
      withLatestFrom(this.settings$),
      map(([choice, settings]) => {
        const updatedSettings: ISettings = { ...settings, translator: choice as Transaltor };

        this.settingsService.saveSettings(updatedSettings);
        this.settingsSubject.next(updatedSettings);

        return choice as Transaltor;
      }),
      startWith(this.settingsService.getSettings().translator ?? Transaltor.APERTIUM)
    );

  vm$ = combineLatest([
    this.selectedTranslator$
  ]).pipe(
    map(([
      selectedTranslator
    ]) => ({
      selectedTranslator
    }))
  );
}
