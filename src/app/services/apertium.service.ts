import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { IApertiumIdentification, IApertiumLanguageCode, IApertiumLanguageNames, IApertiumResponse, IApertiumTranslationRepsonse } from '../interfaces/apertium-interfaces';
import { ILanguage, ITranslation, ITranslator } from '../interfaces/global-transation-interfaces';
import { Transaltor } from '../interfaces/settings-interfaces';

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
  ) {}

  private readonly baseUrl = 'https://apertium.org/apy';
  private languages$: Observable<ILanguage[]> = of([]);

  getLanguages(): Observable<ILanguage[]> {
    return this.languages$.pipe(
      switchMap((langs) => {
        if (langs.length > 0) {
          return of(langs);
        }

        const prs = new Set<string>();

        return this.httpClient.get<IApertiumResponse<IApertiumLanguageCode[]>>(`${this.baseUrl}/listPairs`).pipe(
          switchMap((response) => {
            response.responseData.forEach((p) => prs.add(p.sourceLanguage));

            return this.getLanguageNames(Array.from(prs.values())).pipe(
              map((names) => ({ pairs: response.responseData, names })));
          }),
          map(({ pairs, names }) => Array.from(prs.values()).map(
            (p) => ({
              code: p,
              name: names[p],
              targets: Object.entries(pairs)
                .filter((entry) => entry[1].targetLanguage === p)
                .map((entry) => entry[1].sourceLanguage)
            }))
          ),
          tap((l) => this.languages$ = of(l))
        );  
      })
    );
  }

  getLanguageNames(codes: string[], locale = 'en'): Observable<IApertiumLanguageNames> {
    const params = new URLSearchParams({ locale });
    if (codes.length > 0) {
      params.set('languages', codes.join('+'));
    }

    return this.httpClient.get<IApertiumLanguageNames>(
      `${this.baseUrl}/listLanguageNames?${params.toString()}`
    );
  }

  detectLanguage(text: string): Observable<IApertiumIdentification> {
    return this.httpClient.get<IApertiumIdentification>(
      `${this.baseUrl}/identifyLang?q=${encodeURIComponent(text)}`
    );
  }

  translate(source: string, target: string, text: string): Observable<ITranslation> {
    return this.httpClient.get<IApertiumResponse<IApertiumTranslationRepsonse>>(
      `${this.baseUrl}/translate?langpair=${encodeURIComponent(source)}|${encodeURIComponent(target)}&q=${encodeURIComponent(text)}`
    ).pipe(
      map((result) => ({
        source,
        target,
        result: result.responseData.translatedText,
        original: text,
        translator: Transaltor.APERTIUM
      }))
    );
  }
}
