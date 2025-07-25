import { TabsService } from './tabs.service';

describe('TabsService', () => {
  let service: TabsService;

  beforeEach(() => {
    service = new TabsService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
