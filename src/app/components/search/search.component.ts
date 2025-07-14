import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BehaviorSubject, combineLatest, filter, map, startWith, Subject, switchMap, tap, withLatestFrom } from 'rxjs';
import { ApertiumService } from '../../services/apertium.service';
import { LibreTranslateService } from '../../services/libre-translate.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  constructor(
    private libreTranslateService: LibreTranslateService,
    private apertiumService: ApertiumService
  ) { }

  textToTranslate: string = '';

  // languages$: Observable<ILibreLanguage[]> = this.libreTranslateService
  //   .getLanguages()
  //   .pipe(
  //     startWith([])
  //   );

  languages$ = this.apertiumService.getLanguagePairs().pipe(
    map((langs) => langs.filter((l) => !!l.name)),
    startWith([])
  );

  sourceSubject = new BehaviorSubject<string>('auto');
  source$ = this.sourceSubject.pipe();

  targetSubject = new BehaviorSubject<string>('');
  target$ = this.targetSubject.pipe();

  translateSubject = new Subject<void>();
  translate$ = this.translateSubject.pipe(
    withLatestFrom(this.source$, this.target$),
    filter(([_, source, target]) => !!source && !!target && this.textToTranslate.length > 0),
    switchMap(
      ([__dirname, source, target]) => this.apertiumService.translate(source, target, this.textToTranslate)
        .pipe(
          tap(res => console.log(res))
        )
    ),
    startWith(null)
  );

  vm$ = combineLatest([
    this.languages$,
    this.source$,
    this.target$,
    this.translate$,
  ]).pipe(
    map(([
      languages,
      source,
      target,
      translate
    ]) => ({
      languages,
      source,
      target,
      translate
    }))
  );
}
