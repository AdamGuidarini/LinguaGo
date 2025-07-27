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
    it('should return the observable with tab index', (done) => {
      service.getCurrentTab().subscribe(
        (tab) => {
          expect(tab).toBe(0);
          done();
        }
      );
    });

    it('should update the current tab', (done) => {
      service.changeTab(1);

      service.getCurrentTab().subscribe(
        (tab) => {
          expect(tab).toBe(1);
          done();
        }
      );
    });
  });
});
