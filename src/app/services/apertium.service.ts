import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { IApertiumIdentification, IApertiumLanguageCode, IApertiumLanguageNames, IApertiumResponse, IApertiumTranslationRepsonse } from '../interfaces/apertium-interfaces';
import { ILanguage, ITranslation, ITranslator } from '../interfaces/global-transation-interfaces';

/**
 * Serivce using Aprtium APY for translations.
 * 
 * For more informations, see: https://wiki.apertium.org/wiki/Apertium-apy
 */
@Injectable({
  providedIn: 'root'
})
export class ApertiumService implements ITranslator {

  constructor(
    private httpClient: HttpClient
  ) { }

  private readonly baseUrl = 'https://beta.apertium.org/apy';

  getLanguages(): Observable<ILanguage[]> {
    const prs = new Set<string>();

    return this.httpClient.get<IApertiumResponse<IApertiumLanguageCode[]>>(`${this.baseUrl}/listPairs`).pipe(
      switchMap((response) => {
        response.responseData.forEach((p) => prs.add(p.sourceLanguage));

        return this.getLanguageNames(Array.from(prs.values())).pipe(
          map((names) => ({ pairs: response.responseData, names })));
      }
      ),
      map(({ pairs, names }) => Array.from(prs.values()).map(
        (p) => ({
          code: p,
          name: names[p],
          targets: Object.entries(pairs)
            .filter((entry) => entry[1].targetLanguage === p)
            .map((entry) => entry[1].sourceLanguage)
        }))
      )
    );
  }

  getLanguageNames(codes: string[], locale = 'en'): Observable<IApertiumLanguageNames> {
    return this.httpClient.get<IApertiumLanguageNames>(
      `${this.baseUrl}/listLanguageNames?locale=${locale}${codes.length > 0 ? '&languages=' : ''}${codes.join('+')}`
    );
  }

  detectLanguage(text: string): Observable<IApertiumIdentification> {
    return this.httpClient.get<IApertiumIdentification>(
      `${this.baseUrl}/identifyLang?q=${text}`
    );
  }

  translate(source: string, target: string, text: string): Observable<ITranslation> {
    return this.httpClient.get<IApertiumResponse<IApertiumTranslationRepsonse>>(
      `${this.baseUrl}/translate?langpair=${source}|${target}&q=${text}`
    ).pipe(
      map((result) => ({
        source,
        target,
        result: result.responseData.translatedText,
        original: text
      }))
    );
  }
}
