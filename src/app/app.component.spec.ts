import { createSpyFromClass } from 'jest-auto-spies';
import { AppComponent } from './app.component';
import { TabsService } from './services/tabs.service';

const mockTabsService = createSpyFromClass(TabsService);

describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(() => {
    component = new AppComponent(mockTabsService);
  });

  it('should be truthy', () => {
    expect(component).toBeTruthy();
  });

  it('should set the title', () => {
    expect(component.title).toBe('LinguaGo');
  });
});
