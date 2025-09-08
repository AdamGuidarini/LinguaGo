import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { DateTime } from 'luxon';
import { BehaviorSubject, combineLatest, filter, forkJoin, from, map, Observable, of, startWith, Subject, switchMap, take, tap, throwError, withLatestFrom } from 'rxjs';
import { ITranslation } from '../../interfaces/global-transation-interfaces';
import { Transaltor } from '../../interfaces/settings-interfaces';
import { DataService } from '../../services/data.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatRadioModule,
    FlexLayoutModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  constructor(
    private settingsService: SettingsService,
    private dataService: DataService
  ) { }
  @ViewChild('confirmationdialog') confirmationDialog: ElementRef | undefined;

  settings$ = this.settingsService.getSettings();
  firstSettings$ = this.settings$.pipe(
    take(1),
    tap((settings) => this.selectedTranslatorSubject.next(settings.translator))
  );

  selectedTranslatorSubject = new BehaviorSubject<string>('');
  selectedTranslator$: Observable<Transaltor> = combineLatest([
    this.selectedTranslatorSubject, this.settings$
  ]).pipe(
    map(([choice, settings]) => {
      if (choice && choice !== settings.translator) {
        this.settingsService.saveSettings(
          { ...settings, translator: choice as Transaltor }
        );
      }

      return choice as Transaltor;
    })
  );

  libreTranslateUrlSubject = new Subject<string>();
  libreTranslateUrl$: Observable<string> = this.libreTranslateUrlSubject.pipe(
    withLatestFrom(this.settings$),
    map(([url, settings]) => {
      if (settings.libreTranslateUrl !== url) {
        this.settingsService.saveSettings(
          {
            ...settings,
            libreTranslateUrl: url
          }
        );
      }

      return url;
    }),
    startWith('')
  );

  libreTranslateKeySubject = new Subject<string>();
  libreTranslateKey$ = this.libreTranslateKeySubject.pipe(
    withLatestFrom(this.settings$),
    map(([key, settings]) => {
      if (settings.libreTranslateUrl !== key) {
        this.settingsService.saveSettings(
          {
            ...settings,
            libreTranslateKey: key
          }
        );
      }

      return key;
    }),
    startWith('')
  );

  importClickTrigger = new Subject<void>();
  importClick$ = this.importClickTrigger.pipe(
    switchMap(
      () => this.showDialog(
        'Warning!',
        'Importing data will delete all existing data, do you want to continue?'
      )
    ),
    filter((accept) => accept),
    tap(() => {
      const filePicker = document.getElementById('fileupload');

      filePicker?.click();
    })
  );

  importDataSubject = new Subject<Event>();
  importData$ = this.importDataSubject.pipe(
    switchMap((ev) => {
      const input = ev.target as HTMLInputElement | null;
      const file = input?.files && input.files.length > 0 ? input.files[0] : null;

      if (file) {
        return from(file.text()).pipe(
          switchMap((t) => {
            const data: ITranslation[] = JSON.parse(t);

            return this.dataService.deleteAllTranslations().pipe(
              switchMap(() => forkJoin(
                data.map((d) => this.dataService.addTranslation(d))
              ))
            );
          })
        );
      }

      return of(null);
    })
  );

  exportDataSubject = new Subject<void>();
  exportData$ = this.exportDataSubject.pipe(
    switchMap(() => this.dataService.getTranslations()),
    tap((data) => {
      const now = DateTime.now();
      const blob = new Blob(
        [JSON.stringify(data.translations)]
      );

      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', `linguago_${now.year}-${now.month}-${now.day}-${now.hour}-${now.minute}-${now.second}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
  );

  deleteAllSubject = new Subject<void>();
  deleteAll$ = this.deleteAllSubject.pipe(
    switchMap(() => this.showDialog(
      'Permanently Delete All Translations',
      'Are you sure you want to delete all translations? This action cannot be undone!'
    )),
    filter((accept) => accept),
    switchMap(() => this.dataService.deleteAllTranslations())
  );

  vm$ = combineLatest([
    this.selectedTranslator$,
    this.libreTranslateUrl$,
    this.libreTranslateKey$,
    this.settings$,
    this.firstSettings$
  ]).pipe(
    map(([
      selectedTranslator,
      libreTranslateUrl,
      libreTranslateKey,
      settings,
      firstSettings
    ]) => ({
      selectedTranslator,
      libreTranslateUrl,
      libreTranslateKey,
      settings,
      firstSettings
    }))
  );

  triggers$ = combineLatest([
    this.importData$,
    this.exportData$,
    this.deleteAll$,
    this.importClick$
  ]);

  showDialog(dialogTitle: string, dialogMessage: string): Observable<boolean> {
    if (!this.confirmationDialog) {
      return throwError(() => 'Could not bind confirmation dialog');
    }

    this.confirmationDialog.nativeElement.showModal();

    return new Observable((observer) => {
      const title = document.getElementById('title');
      const message = document.getElementById('message');
      const cancel = document.getElementById('cancel');
      const accept = document.getElementById('accept');

      console.log(title, dialogTitle, message, dialogMessage);

      if (title && message) {
        title.textContent = dialogTitle;
        message.textContent = dialogMessage;
      } else {
        observer.error('Could not bind title or message elements in dialog');
        return;
      }

      if (!cancel || !accept) {
        observer.error('Could not bind cancel or accept elements in dialog');
        return;
      }

      accept.addEventListener(
        'click',
        () => {
          this.confirmationDialog?.nativeElement.close();

          observer.next(true);
          observer.complete();
        }
      );

      cancel.addEventListener(
        'click',
        () => {
          this.confirmationDialog?.nativeElement.close();

          observer.next(false);
          observer.complete();
        }
      );
    });
  }
}
