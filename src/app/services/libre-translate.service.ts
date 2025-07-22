import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { ILanguage, ITranslation, ITranslator } from '../interfaces/global-transation-interfaces';
import { ILibreRequest, ILibreTranslation } from '../interfaces/libre-translate-interfaces';
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
      switchMap((settings) => this.httpClient.get<ILanguage[]>(
        `${settings.libreTranslateUrl}/languages`
      ))
    );
  }

  translate(source: string, target: string, text: string): Observable<ITranslation> {
    const body: ILibreRequest = {
      q: text,
      source,
      target
    };

    return this.settingsService.getSettings().pipe(
      switchMap((settings) => this.httpClient.post<ILibreTranslation>(
        `${settings.libreTranslateUrl}/translate`,
        body
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
