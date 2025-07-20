import { Injectable } from '@angular/core';
import { ILanguage } from '../interfaces/global-transation-interfaces';
import { from, Observable } from 'rxjs';
import { IGoogleTranslateResponse } from '../interfaces/google-interfaces';

@Injectable({
  providedIn: 'root'
})
export class GoogleTranslateService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  _translate = require('google-translate-api-x');

  getLanguages(): ILanguage[] {
    const langObj = this._translate.languages as Record<string, string>;

    return Object.keys(langObj)
      .map((key) => ({
        code: key,
        name: langObj[key]
      })
    );
  }

  translate(source: string, target: string, text: string): Observable<IGoogleTranslateResponse> {
    return from<Observable<IGoogleTranslateResponse>>(this._translate(text, { from: source, to: target, autoCorrect: true }));
  }
}
