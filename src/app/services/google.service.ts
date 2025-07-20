import { Injectable } from '@angular/core';
import { googleTranslateApi, languages } from 'google-translate-api-x';
import { from, map, Observable } from 'rxjs';
import Browser from 'webextension-polyfill';
import { ITranslateMessage } from '../../extension-actions/interfaces/translate-message-interfaces';
import { ILanguage, ITranslation } from '../interfaces/global-transation-interfaces';

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

  translate(source: string, target: string, text: string): Observable<ITranslation> {
    return from(
      Browser.runtime.sendMessage(
        { source, target, text, service: 'GoogleTranslateService' } as ITranslateMessage
      )
    ).pipe(
      map((res) => {
        const result = res as { success: boolean, result: googleTranslateApi.TranslationResponse, error: unknown };

        return {
          source,
          target,
          result: result.result.text,
          original: text,
          confidence: (result.result.raw as unknown as { confidence: number })?.confidence
        };
      })
    );
  }
}
