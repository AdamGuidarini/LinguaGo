import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
  withLatestFrom
} from 'rxjs';
import { ILanguage, ITranslator } from '../../interfaces/global-transation-interfaces';
import { Transaltor } from '../../interfaces/settings-interfaces';
import { ApertiumService } from '../../services/apertium.service';
import { GoogleTranslateService } from '../../services/google.service';
import { LibreTranslateService } from '../../services/libre-translate.service';
import { SettingsService } from '../../services/settings.service';
import { TabsService } from '../../services/tabs.service';
import { DataService } from '../../services/data.service';
import { DateTime } from 'luxon';

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
    HttpClientModule
  ],
  templateUrl: './translation.component.html',
  styleUrl: './translation.component.scss'
})
export class TranslationComponent {
  constructor(
    private apertiumService: ApertiumService,
    private libreTranslateService: LibreTranslateService,
    private googleTranslateService: GoogleTranslateService,
    private settingsService: SettingsService,
    private tabsService: TabsService,
    private dataService: DataService
  ) { }

  translator = Transaltor;

  textToTranslateSubject = new Subject<string>();
  textToTranslate$: Observable<string> = this.textToTranslateSubject.pipe(
    startWith('')
  );

  settings$ = this.settingsService.getSettings();
  currentTab$ = this.tabsService.getCurrentTab().pipe(
    tap((tab) => tab === 0 ? this.errorSubject.next('') : null)
  );

  languages$: Observable<ILanguage[]> = combineLatest(
    [this.settings$, this.currentTab$]
  ).pipe(
    filter(([, currentTab]) => currentTab === 0),
    map(([settings]) => settings),
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
    catchError((err: Error) => {
      console.error(err);
      this.errorSubject.next(
        'Unable to retrieve languages'
      );

      return of([]);
    }),
    shareReplay(),
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

      if (source !== 'auto' && target && targetLangs.findIndex((tl) => tl.code === target) === -1) {
        this.targetSubject.next('');
      }

      return targetLangs;
    }),
    startWith([])
  );

  errorSubject = new Subject<string>();
  error$: Observable<string> = this.errorSubject.pipe(
    startWith('')
  );

  translateSubject = new Subject<void>();
  translate$ = this.translateSubject.pipe(
    withLatestFrom(this.source$, this.target$, this.settings$, this.textToTranslate$),
    filter(([, source, target,, textToTranslate]) => !!source && !!target && textToTranslate.length > 0),
    switchMap(
      ([, source, target, settings, textToTranslate]) => {
        let service: ITranslator;

        this.errorSubject.next('');

        switch (settings.translator) {
          case Transaltor.GOOGLE:
            service = this.googleTranslateService;
            break;
          case Transaltor.LIBRETRANSLATE:
            service = this.libreTranslateService;
            break;
          case Transaltor.APERTIUM:
          default:
            service = this.apertiumService;
        }

        return service.translate(source, target, textToTranslate).pipe(
          tap((translation) => {
            this.translationSubject.next(translation.result);

            translation.key = crypto.randomUUID();
            translation.timestamp = DateTime.now().toUTC().toISO();

            this.dataService.addTranslation(translation);
          }),
          catchError((err: Error) => {
            console.error(err);
            this.errorSubject.next(
              `Translation failed with error: ${err.message}`
            );

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
    this.translation$,
    this.settings$,
    this.textToTranslate$,
    this.error$
  ]).pipe(
    map(([
      languages,
      targetLangs,
      source,
      target,
      translate,
      translation,
      settings,
      textToTranslate,
      error
    ]) => ({
      languages,
      targetLangs,
      source,
      target,
      translate,
      translation,
      settings,
      textToTranslate,
      error
    }))
  );
}
