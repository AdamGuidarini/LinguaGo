/* eslint-disable @angular-eslint/prefer-inject */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, combineLatest, filter, map, share, startWith, Subject, switchMap, tap, withLatestFrom } from 'rxjs';
import { ApertiumService } from '../../services/apertium.service';

@Component({
  selector: 'app-search',
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
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  constructor(
    private apertiumService: ApertiumService
  ) { }

  textToTranslate = '';

  languages$ = this.apertiumService.getLanguages().pipe(
    map((langs) => langs.filter((l) => !!l.name)),
    share(),
    startWith([])
  );

  sourceSubject = new BehaviorSubject<string>('auto');
  source$ = this.sourceSubject.pipe();

  targetSubject = new BehaviorSubject<string>('');
  target$ = this.targetSubject.pipe();

  targetLanguages$ = combineLatest(
    [this.languages$, this.source$, this.target$]
  ).pipe(
    map(([languages, source, target]) => {
      const targetLangs = source === 'auto' ? languages : languages.filter((l) => l.pairsWith.includes(source));

      if (!targetLangs.findIndex((tl) => tl.code === target)) {
        this.targetSubject.next('');
      }

      return targetLangs;
    }),
    startWith([])
  );

  translateSubject = new Subject<void>();
  translate$ = this.translateSubject.pipe(
    withLatestFrom(this.source$, this.target$),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filter(([_, source, target]) => !!source && !!target && this.textToTranslate.length > 0),
    switchMap(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, source, target]) => this.apertiumService.translate(source, target, this.textToTranslate)
        .pipe(
          tap((res) => this.translationSubject.next(res.responseData.translatedText))
        )
    ),
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
