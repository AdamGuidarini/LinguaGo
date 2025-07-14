import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(() => {
    component = new AppComponent();
  });

  it('should be truthy', () => {
    expect(component).toBeTruthy();
  });

  it('should set the title', () => {
    expect(component.title).toBe('LexiGo');
  });
});
