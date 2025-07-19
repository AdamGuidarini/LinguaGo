import { createSpyFromClass } from 'jest-auto-spies';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../services/settings.service';
import { Transaltor } from '../../interfaces/settings-interfaces';

const mockSettingsService = createSpyFromClass(SettingsService);

describe('SettingsComponent', () => {
  let component: SettingsComponent;

  beforeEach(async () => {
    mockSettingsService.getSettings.mockReturnValue(
      {
        translator: Transaltor.APERTIUM
      }
    );

    component = new SettingsComponent(
      mockSettingsService
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
