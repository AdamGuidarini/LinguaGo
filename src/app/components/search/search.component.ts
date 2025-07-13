import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { map, Observable, of } from 'rxjs';
import { ILibreLanguage } from '../../interfaces/libre-translate-interfaces';
import { LibreTranslateService } from '../../services/libre-translate.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  constructor(
    private libreTranslateService: LibreTranslateService
  ) { }

  languages$: Observable<ILibreLanguage[]> = of([]);

  ngOnInit(): void {
    this.languages$ = this.libreTranslateService
      .getLanguages()
      .pipe(
        map((langs) => {
          langs.unshift({
            code: 'auto',
            name: 'Auto',
            targets: []
          });

          return langs;
        })
      );
  }
}
