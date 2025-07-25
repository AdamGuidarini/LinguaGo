import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { ILanguage, ITranslation, ITranslator } from '../interfaces/global-transation-interfaces';
import { ILibreTranslation } from '../interfaces/libre-translate-interfaces';
import { SettingsService } from './settings.service';


/**
 * A service to allow translations through the LibreTranslate open source translator.
 * 
 * For more information: https://libretranslate.com/
 */
@Injectable({
  providedIn: 'root'
})
export class LibreTranslateService implements ITranslator {
  constructor(
    private httpClient: HttpClient,
    private settingsService: SettingsService
  ) { }

  getLanguages(): Observable<ILanguage[]> {
    return this.settingsService.getSettings().pipe(
      switchMap((settings) => {
        if (!settings.libreTranslateUrl) {
          console.error('LibreTranslate selected as translor, but no url provided');

          return of([]);
        }        

        return this.httpClient.get<ILanguage[]>(
          `${settings.libreTranslateUrl}/languages`
        );
      })
    );
  }

  translate(source: string, target: string, text: string): Observable<ITranslation> {
    return this.settingsService.getSettings().pipe(
      switchMap((settings) => this.httpClient.post<ILibreTranslation>(
        `${settings.libreTranslateUrl}/translate`,
        {
          q: text,
          source,
          target,
          api_key: settings.libreTranslateKey
        }
      )),
      map((result) => ({
        source: source === 'auto' && result.detectedLanguage ? result.detectedLanguage.language : source,
        target,
        result: result.translatedText,
        original: text,
        confidence: result.detectedLanguage?.confidence,
        alternatives: result.alternatives
      }))
    );
  }
}
