import { createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';
import { ApertiumService } from '../../services/apertium.service';
import { LibreTranslateService } from '../../services/libre-translate.service';
import { SearchComponent } from './search.component';

const mockLibreTranslateService = createSpyFromClass(LibreTranslateService);
const mockApertiumService = createSpyFromClass(ApertiumService);
const langList = [{ name: 'Foo', code: 'fo', targets: [] }];

describe('SearchComponent', () => {
  let component: SearchComponent;

  beforeEach(async () => {
    mockLibreTranslateService.getLanguages.mockReturnValue(
      of(langList)
    );

    component = new SearchComponent(
      mockLibreTranslateService,
      mockApertiumService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('languages stream', () => {
    it('should populate languages', () => {
      component.languages$.subscribe(
        (langs) => expect(langs).toBe(langList)
      )
    });
  });
});
