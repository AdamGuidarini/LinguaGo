import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { DataService } from '../../services/data.service';
import { DatetimePipe } from '../../pipes/datetime.pipe';
import { TabsService } from '../../services/tabs.service';
import { FlexModule } from '@angular/flex-layout';
import { LanguageNamePipe } from '../../pipes/language-name.pipe';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    DatetimePipe,
    LanguageNamePipe,
    FlexModule
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
    switchMap(() => this.dataService.getTranslations()),
    tap((res) => {
      console.log(res);
    })
  );

  countSubject = new BehaviorSubject<number>(0);

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
