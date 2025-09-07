import { Pipe, PipeTransform } from '@angular/core';
import { ApertiumService } from '../services/apertium.service';
import { LibreTranslateService } from '../services/libre-translate.service';
import { GoogleTranslateService } from '../services/google.service';
import { Transaltor } from '../interfaces/settings-interfaces';
import { map, Observable, of } from 'rxjs';
import { ITranslator } from '../interfaces/global-transation-interfaces';

@Pipe({
  name: 'languagename',
  standalone: true
})
export class LanguageNamePipe implements PipeTransform {
  constructor(
    private apertiumService: ApertiumService,
    private libreTranslateService: LibreTranslateService,
    private googleTranslateService: GoogleTranslateService
  ) {}

  transform(value: string, transaltor: Transaltor): Observable<string> {
    let service: ITranslator;

    switch (transaltor) {
      case Transaltor.APERTIUM:
        service = this.apertiumService;
        break;
      case Transaltor.LIBRETRANSLATE:
        service = this.libreTranslateService;
        break;
      case Transaltor.GOOGLE:
        service = this.googleTranslateService;
        break;
      default:
        return of('');
    }

    return service.getLanguages().pipe(
      map((langs) => langs.find((l) => l.code === value)?.name || value)
    );
  }
}
