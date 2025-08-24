import { Pipe, PipeTransform } from '@angular/core';
import { ApertiumService } from '../services/apertium.service';
import { LibreTranslateService } from '../services/libre-translate.service';
import { GoogleTranslateService } from '../services/google.service';
import { Transaltor } from '../interfaces/settings-interfaces';

@Pipe({
  name: 'languagename',
  standalone: true
})
export class LanguageNamePipe implements PipeTransform {
  constructor(
    private ApertiumService: ApertiumService,
    private libreTranslateService: LibreTranslateService,
    private googleTranslateService: GoogleTranslateService
  ) {}

  transform(value: unknown, ...args: Transaltor[]): unknown {
    console.log(value, args);



    return null;
  }
}
