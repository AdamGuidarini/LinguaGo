import { createSpyFromClass } from 'jest-auto-spies';
import { LanguageNamePipe } from './language-name.pipe';
import { ApertiumService } from '../services/apertium.service';
import { LibreTranslateService } from '../services/libre-translate.service';
import { GoogleTranslateService } from '../services/google.service';

const mockApertiumSerivce = createSpyFromClass(ApertiumService);
const mockLibreTranslateService = createSpyFromClass(LibreTranslateService);
const mockGoogleTranslateSerivce = createSpyFromClass(GoogleTranslateService);

describe('LanguageNamePipe', () => {
  it('create an instance', () => {
    const pipe = new LanguageNamePipe(
      mockApertiumSerivce,
      mockLibreTranslateService,
      mockGoogleTranslateSerivce
    );
    expect(pipe).toBeTruthy();
  });
});
