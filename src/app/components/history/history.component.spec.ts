import { createSpyFromClass } from 'jest-auto-spies';
import { DataService } from '../../services/data.service';
import { HistoryComponent } from './history.component';
import { TabsService } from '../../services/tabs.service';
import { of } from 'rxjs';

const mockDataService = createSpyFromClass(DataService);
const mockTabsService = createSpyFromClass(TabsService);

describe('HistoryComponent', () => {
  let component: HistoryComponent;

  beforeEach(() => {
    mockTabsService.getCurrentTab.mockReturnValue(of(1));

    component = new HistoryComponent(
      mockDataService,
      mockTabsService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
