import { createSpyFromClass } from 'jest-auto-spies';
import { of } from 'rxjs';
import { ApertiumService } from '../../services/apertium.service';
import { SearchComponent } from './search.component';

const mockApertiumService = createSpyFromClass(ApertiumService);
const langList = [{ name: 'Foo', code: 'fo', pairsWith: [] }];

describe('SearchComponent', () => {
  let component: SearchComponent;

  beforeEach(async () => {
    mockApertiumService.getLanguages.mockReturnValue(
      of(langList)
    );

    component = new SearchComponent(
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
