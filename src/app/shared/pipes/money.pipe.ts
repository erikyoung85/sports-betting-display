import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money',
})
export class MoneyPipe implements PipeTransform {
  constructor() {}

  transform(value: string | number): string {
    const num = Number(value);
    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }
}
