import { DataService } from './data.service';

describe('DataService', () => {
  let service: DataService;

  beforeEach(() => {
    service = new DataService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
