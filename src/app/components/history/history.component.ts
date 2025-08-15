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

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule
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
    catchError((err) => {
      console.error(err);

      return of(false);
    }),
    startWith(false)
  );

  translationHistory$ = this.dbReady$.pipe(
    filter((dbReady) => !!dbReady),
    switchMap(() => this.dataService.getTranslations()),
    tap((res) => {
      console.log(res);
    })
  );

  countSubject = new BehaviorSubject<number>(0);
  count$ = this.countSubject.asObservable();

  vm$ = combineLatest([
    this.translationHistory$,
    this.count$
  ]).pipe(
    map(([
      translationHistory,
      count
    ]) => ({
      translationHistory,
      count
    }))
  );
}
