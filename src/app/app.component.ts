import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet } from '@angular/router';
import { HistoryComponent } from './components/history/history.component';
import { SearchComponent } from './components/search/search.component';
import { SettingsComponent } from './components/settings/settings.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SearchComponent,
    HistoryComponent,
    SettingsComponent,
    MatTabsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'LexiGo';
}
