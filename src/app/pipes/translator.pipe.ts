import { Pipe, PipeTransform } from '@angular/core';
import { Transaltor } from '../interfaces/settings-interfaces';

@Pipe({
  name: 'translator',
  standalone: true
})
export class TranslatorPipe implements PipeTransform {

  transform(value: Transaltor): string {
    switch (value) {
      case Transaltor.GOOGLE:
        return 'Google';
      case Transaltor.LIBRETRANSLATE:
        return 'LibreTranslate';
      case Transaltor.APERTIUM:
        return 'Apertium';
    }

    return '';
  }
}
