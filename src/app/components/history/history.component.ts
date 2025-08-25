import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FlexModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import {
  catchError,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  tap
} from 'rxjs';
import { ITranslation } from '../../interfaces/global-transation-interfaces';
import { DatetimePipe } from '../../pipes/datetime.pipe';
import { LanguageNamePipe } from '../../pipes/language-name.pipe';
import { TranslatorPipe } from '../../pipes/translator.pipe';
import { DataService } from '../../services/data.service';
import { TabsService } from '../../services/tabs.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    DatetimePipe,
    LanguageNamePipe,
    TranslatorPipe,
    FlexModule,
    MatIconModule
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  constructor(
    private dataService: DataService,
    private tabsService: TabsService
  ) { }

  private readonly batchSize = 50;

  dbReady$: Observable<boolean> = this.dataService.setUp().pipe(
    map(() => true),
    catchError((err) => {
      console.error(err);

      return of(false);
    }),
    startWith(false)
  );

  translationHistory$ = combineLatest([
    this.dbReady$, this.tabsService.getCurrentTab()
  ]).pipe(
    filter(([dbReady, tab]) => !!dbReady && tab === 1),
    switchMap(() => this.dataService.getTranslations())
  );

  deleteTranslationSubject = new Subject<ITranslation>();
  deleteTranslation$ = this.deleteTranslationSubject.pipe(
    tap((t) => {
      if (t.key) {
        this.dataService.deleteTranslation(t.key);
      }
    }),
    tap(() => this.tabsService.changeTab(1))
  );

  vm$ = combineLatest([
    this.translationHistory$
  ]).pipe(
    map(([
      translationHistory
    ]) => ({
      translationHistory
    }))
  );
}
