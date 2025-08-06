import { createSpyFromClass } from 'jest-auto-spies';
import { DataService } from '../../services/data.service';
import { HistoryComponent } from './history.component';

const mockDataService = createSpyFromClass(DataService);

describe('HistoryComponent', () => {
  let component: HistoryComponent;

  beforeEach(async () => {
    component = new HistoryComponent(mockDataService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
