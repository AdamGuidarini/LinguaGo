import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { ILanguage } from '../interfaces/global-transation-interfaces';
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
export class LibreTranslateService {
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

  translate(source: string, target: string, text: string): Observable<ILibreTranslation> {
    const body: ILibreRequest = {
      q: text,
      source,
      target
    };

    return this.settingsService.getSettings().pipe(
      switchMap((settings) => this.httpClient.post<ILibreTranslation>(
        `${settings.libreTranslateUrl}/translate`,
        body
      ))
    );
  }
}
