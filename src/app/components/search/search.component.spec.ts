import { createSpyFromClass } from 'jest-auto-spies';
import { LibreTranslateService } from '../../services/libre-translate.service';
import { SearchComponent } from './search.component';

const mockLibreTranslateService = createSpyFromClass(LibreTranslateService);

describe('SearchComponent', () => {
  let component: SearchComponent;

  beforeEach(async () => {
    component = new SearchComponent(
      mockLibreTranslateService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
