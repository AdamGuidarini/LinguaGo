import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabsService {
  private readonly currentTabSubject = new BehaviorSubject<number>(0);

  getCurrentTab(): Observable<number> {
    return this.currentTabSubject.asObservable();
  }

  changeTab(index: number): void {
    this.currentTabSubject.next(index);
  }
}