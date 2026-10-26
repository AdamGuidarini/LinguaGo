import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet } from '@angular/router';
import { HistoryComponent } from './components/history/history.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TranslationComponent } from './components/translation/translation.component';
import { TabsService } from './services/tabs.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TranslationComponent,
    HistoryComponent,
    SettingsComponent,
    MatTabsModule,
    TranslocoModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(
    private tabsService: TabsService
  ) {}

  title = 'LinguaGo';

  onTabChange(index: number): void {
    this.tabsService.changeTab(index);
  }
}
