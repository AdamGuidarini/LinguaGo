import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, catchError, combineLatest, filter, map, Observable, startWith, Subject, switchMap, tap, withLatestFrom } from 'rxjs';
import { ILanguage } from '../../interfaces/global-transation-interfaces';
import { Transaltor } from '../../interfaces/settings-interfaces';
import { ApertiumService } from '../../services/apertium.service';
import { GoogleTranslateService } from '../../services/google.service';
import { LibreTranslateService } from '../../services/libre-translate.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-translation',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    FormsModule,
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatButtonModule
  ],
  templateUrl: './translation.component.html',
  styleUrl: './translation.component.scss'
})
export class TranslationComponent {
  constructor(
    private apertiumService: ApertiumService,
    private libreTranslateService: LibreTranslateService,
    private googleTranslateService: GoogleTranslateService,
    private settingsService: SettingsService
  ) { }

  textToTranslate = '';

  settings$ = this.settingsService.getSettings();

  languages$: Observable<ILanguage[]> = this.settings$.pipe(
    switchMap((settings) => {
      switch (settings.translator) {
        case Transaltor.GOOGLE:
          return this.googleTranslateService.getLanguages();
        case Transaltor.LIBRETRANSLATE:
          return this.libreTranslateService.getLanguages();
        case Transaltor.APERTIUM:
        default:
          return this.apertiumService.getLanguages().pipe(
            map((langs) => langs.filter((lang) => !!lang.name))
          );
      }
    }),
    startWith([])
  );

  sourceSubject = new BehaviorSubject<string>('');
  source$ = this.sourceSubject.pipe();

  targetSubject = new BehaviorSubject<string>('');
  target$ = this.targetSubject.pipe();

  targetLanguages$: Observable<ILanguage[]> = combineLatest(
    [this.languages$, this.source$, this.target$, this.settings$]
  ).pipe(
    map(([languages, source, target, settings]) => {
      if (settings.translator === Transaltor.GOOGLE) {
        const langs = [...languages];
        langs.shift();

        return langs;
      }

      const targetLangs = source === 'auto' ? languages : languages.filter((l) => l.targets?.includes(source));

      if (!targetLangs.findIndex((tl) => tl.code === target)) {
        this.targetSubject.next('');
      }

      return targetLangs;
    }),
    startWith([])
  );

  translateSubject = new Subject<void>();
  translate$ = this.translateSubject.pipe(
    withLatestFrom(this.source$, this.target$, this.settings$),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filter(([_, source, target]) => !!source && !!target && this.textToTranslate.length > 0),
    switchMap(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, source, target, settings]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let translateFunc: (source: string, target: string, text: string) => Observable<any>;

        switch (settings.translator) {
          case Transaltor.GOOGLE:
            translateFunc = this.googleTranslateService.translate;
            break;
          case Transaltor.LIBRETRANSLATE:
            translateFunc = this.libreTranslateService.translate;
            break;
          case Transaltor.APERTIUM:
          default:
            translateFunc = this.apertiumService.translate;
        }

        return translateFunc(source, target, this.textToTranslate).pipe(
          tap((res) => console.log(res)),
          catchError((err) => {
            console.error(err);

            return '';
          })
        );
      }),
    startWith(null)
  );

  translationSubject = new Subject<string>();
  translation$ = this.translationSubject.pipe(
    startWith('')
  );

  vm$ = combineLatest([
    this.languages$,
    this.targetLanguages$,
    this.source$,
    this.target$,
    this.translate$,
    this.translation$
  ]).pipe(
    map(([
      languages,
      targetLangs,
      source,
      target,
      translate,
      translation
    ]) => ({
      languages,
      targetLangs,
      source,
      target,
      translate,
      translation
    }))
  );
}
