import { LibreTranslateService } from '../../services/libre-translate.service';
import { SearchComponent } from './search.component';

// const mockLibreTranslateService = createSpyFromClass()

describe('SearchComponent', () => {
  let component: SearchComponent;

  beforeEach(async () => {
    component = new SearchComponent(
      // new LibreTranslateService()
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
