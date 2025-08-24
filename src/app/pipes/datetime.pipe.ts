import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datetime',
  standalone: true
})
export class DatetimePipe implements PipeTransform {

  transform(value: string | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString();

    return `${dateStr} ${timeStr}`;
  }
}
