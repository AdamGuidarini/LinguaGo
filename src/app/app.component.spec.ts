import { beforeEach, describe, expect, it } from "vitest";
import { mock } from 'vitest-mock-extended';
import { AppComponent } from './app.component';
import { TabsService } from './services/tabs.service';

const mockTabsService = mock<TabsService>();

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

  describe('onTabChange method', () => {
    it('should change the active tab', () => {
      component.onTabChange(0);

      expect(mockTabsService.changeTab).toHaveBeenCalledWith(0);
    });
  });
});
