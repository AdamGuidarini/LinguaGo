import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ILibreLanguage, ILibreRequest, ILibreTranslation } from '../interfaces/libre-translate-interfaces';

@Injectable({
  providedIn: 'root'
})
export class LibreTranslateService {
  constructor(
    private httpClient: HttpClient
  ) { }

  private readonly baseUrl = 'https://libretranslate.com';

  getLanguages(): Observable<ILibreLanguage[]> {
    return this.httpClient.get<ILibreLanguage[]>(
      `${this.baseUrl}/languages`
    );
  }

  translate(source: string, target: string, text: string): Observable<ILibreTranslation> {
    const body: ILibreRequest = {
      q: text,
      source,
      target
    }

    return this.httpClient.post<ILibreTranslation>(
      `${this.baseUrl}/translate`,
      body
    )
  }
}
