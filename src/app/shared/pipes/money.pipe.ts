import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money',
})
export class MoneyPipe implements PipeTransform {
  constructor() {}

  transform(value: string | number): string {
    const number = Number(value);
    const isNegative = number < 0;

    const formattedNumber = `${isNegative ? '-' : ''}$${Math.abs(
      number
    ).toFixed(2)}`;
    if (formattedNumber.endsWith('.00')) {
      return `$${Math.abs(number).toFixed(0)}`;
    }
    return formattedNumber;
  }
}
