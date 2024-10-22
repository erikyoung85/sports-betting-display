import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money',
})
export class MoneyPipe implements PipeTransform {
  constructor() {}

  transform(value: string | number): string {
    const number = Number(value);
    return `$${number.toFixed(2)}`;
  }
}
