import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ILibreLanguage, ILibreRequest, ILibreTranslation } from '../interfaces/libre-translate-interfaces';
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

  getLanguages(): Observable<ILibreLanguage[]> {
    return this.httpClient.get<ILibreLanguage[]>(
      `${this.settingsService.getSettings().libreTranslateUrl}/languages`
    );
  }

  translate(source: string, target: string, text: string): Observable<ILibreTranslation> {
    const body: ILibreRequest = {
      q: text,
      source,
      target
    }

    return this.httpClient.post<ILibreTranslation>(
      `${this.settingsService.getSettings().libreTranslateUrl}/translate`,
      body
    );
  }
}
