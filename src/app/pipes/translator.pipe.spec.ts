import { Transaltor } from '../interfaces/settings-interfaces';
import { TranslatorPipe } from './translator.pipe';

describe('TranslatorPipe', () => {
  let pipe: TranslatorPipe;

  beforeEach(() => {
    pipe = new TranslatorPipe();
  });

  describe('transform method', () => {
    it('should translate for Google Translate', () => {
      const retVal = pipe.transform(
        Transaltor.GOOGLE
      );

      expect(retVal).toBe('Google');
    });

    it('should translate for LibreTranslate', () => {
      const retVal = pipe.transform(
        Transaltor.LIBRETRANSLATE
      );

      expect(retVal).toBe('LibreTranslate');
    });

    it('should translate for Apertium', () => {
      const retVal = pipe.transform(
        Transaltor.APERTIUM
      );

      expect(retVal).toBe('Apertium');
    });
  });
});
