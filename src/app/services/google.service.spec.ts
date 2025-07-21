import { GoogleTranslateService } from './google.service';

jest.mock('webextension-polyfill');

describe('GoogleService', () => {
  let service: GoogleTranslateService;

  beforeEach(() => {
    service = new GoogleTranslateService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
