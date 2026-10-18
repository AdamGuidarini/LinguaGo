import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { beforeEach, describe, expect, it } from "vitest";
import { TabsService } from './tabs.service';

describe('TabsService', () => {
  let service: TabsService;

  beforeEach(() => {
    service = new TabsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCurrentTab method', () => {
    it('should return the observable with tab index', () => {
      const sub = subscribeSpyTo(service.getCurrentTab());

      expect(sub.getFirstValue()).toBe(0);
    });

    it('should update the current tab', () => {
      service.changeTab(1);

      const sub = subscribeSpyTo(service.getCurrentTab());

      expect(sub.getFirstValue()).toBe(1);
    });
  });
});
