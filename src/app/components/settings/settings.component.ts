import { Component } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatCard,
    MatFormFieldModule,
    MatRadioModule,
    FlexLayoutModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {

}
