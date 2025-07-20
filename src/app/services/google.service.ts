import { Injectable } from '@angular/core';
import { languages, singleTranslate } from 'google-translate-api-x';
import { from } from 'rxjs';
import { ILanguage } from '../interfaces/global-transation-interfaces';

@Injectable({
  providedIn: 'root'
})
export class GoogleTranslateService {
  getLanguages(): ILanguage[] {
    const langObj = languages as Record<string, string>;

    return Object.keys(langObj)
      .map((key) => ({
        code: key,
        name: langObj[key]
      })
    );
  }

  translate(source: string, target: string, text: string) {
    return from(singleTranslate(text, { from: source, to: target, autoCorrect: true }));
  }
}
