import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { combineLatest, map, Observable, startWith, Subject, withLatestFrom } from 'rxjs';
import { ISettings, Transaltor } from '../../interfaces/settings-interfaces';
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
    private settingsService: SettingsService
  ) { }

  settings$ = this.settingsService.getSettings();

  selectedTranslatorSubject = new Subject<string>();
  selectedTranslator$: Observable<Transaltor> = this.selectedTranslatorSubject
    .pipe(
      withLatestFrom(this.settings$),
      map(([choice, settings]) => {
        const updatedSettings: ISettings = { ...settings, translator: choice as Transaltor };

        this.settingsService.saveSettings(updatedSettings);

        return choice as Transaltor;
      }),
      startWith(Transaltor.APERTIUM)
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
