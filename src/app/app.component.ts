import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet } from '@angular/router';
import { HistoryComponent } from './components/history/history.component';
import { TranslationComponent } from './components/translation/translation.component';
import { SettingsComponent } from './components/settings/settings.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TranslationComponent,
    HistoryComponent,
    SettingsComponent,
    MatTabsModule,
    HttpClientModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [HttpClient]
})
export class AppComponent {
  title = 'LinguaGo';
}
