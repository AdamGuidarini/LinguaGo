import { createSpyFromClass } from 'jest-auto-spies';
import { LanguageNamePipe } from './language-name.pipe';
import { ApertiumService } from '../services/apertium.service';
import { LibreTranslateService } from '../services/libre-translate.service';
import { GoogleTranslateService } from '../services/google.service';
import { ILanguage } from '../interfaces/global-transation-interfaces';
import { firstValueFrom, of } from 'rxjs';
import { Transaltor } from '../interfaces/settings-interfaces';

const mockApertiumSerivce = createSpyFromClass(ApertiumService);
const mockLibreTranslateService = createSpyFromClass(LibreTranslateService);
const mockGoogleTranslateSerivce = createSpyFromClass(GoogleTranslateService);

describe('LanguageNamePipe', () => {
  let pipe: LanguageNamePipe;
  let mockLangs: ILanguage[];

  beforeEach(() => {
    mockLangs = [
      { code: 'it', name: 'Italian', targets: ['spa'] },
      { code: 'eng', name: 'English', targets: ['spa'] },
      { code: 'spa', name: 'Spanish', targets: ['it', 'eng'] }
    ];

    pipe = new LanguageNamePipe(
      mockApertiumSerivce,
      mockLibreTranslateService,
      mockGoogleTranslateSerivce
    );
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  describe('transform method', () => {
    it('should name for the lang code - Apertium', async () => {
      mockApertiumSerivce.getLanguages.mockReturnValue(
        of(mockLangs)
      );

      const retVal = await firstValueFrom(
        pipe.transform(mockLangs[0].code, Transaltor.APERTIUM)
      );

      expect(retVal).toBe(
        mockLangs[0].name
      );
    });

    it('should name for the lang code - LibreTranslate', async () => {
      mockLibreTranslateService.getLanguages.mockReturnValue(
        of(mockLangs)
      );

      const retVal = await firstValueFrom(
        pipe.transform(mockLangs[0].code, Transaltor.LIBRETRANSLATE)
      );

      expect(retVal).toBe(
        mockLangs[0].name
      );
    });

    it('should name for the lang code - Google', async () => {
      mockGoogleTranslateSerivce.getLanguages.mockReturnValue(
        of(mockLangs)
      );

      const retVal = await firstValueFrom(
        pipe.transform(mockLangs[0].code, Transaltor.GOOGLE)
      );

      expect(retVal).toBe(
        mockLangs[0].name
      );
    });
  });
});
