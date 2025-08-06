import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BehaviorSubject, catchError, combineLatest, filter, map, Observable, of, startWith, switchMap, tap, withLatestFrom } from 'rxjs';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  constructor(
    private dataService: DataService
  ) { }

  private readonly batchSize = 50;

  dbReady$: Observable<boolean> = this.dataService.setUp().pipe(
    map(() => true),
    catchError(() => of(false)),
    startWith(false)
  );

  translationStartIndexSubject = new BehaviorSubject<number>(0);
  translationHistory$ = this.translationStartIndexSubject.pipe(
    withLatestFrom(this.dbReady$),
    filter(([, dbReady]) => !!dbReady),
    tap(() => console.log('Ready to fetch translations')),
    switchMap(([start]) => this.dataService.getTranslations(start, this.batchSize)),
    tap((res) => this.countSubject.next(res.count))
  );

  countSubject = new BehaviorSubject<number>(0);
  count$ = this.countSubject.asObservable();

  vm$ = combineLatest([
    this.dbReady$,
    this.translationHistory$,
    this.count$
  ]).pipe(
    map(([
      ,
      translationHistory,
      count
    ]) => ({
      translationHistory,
      count
    }))
  );
}
