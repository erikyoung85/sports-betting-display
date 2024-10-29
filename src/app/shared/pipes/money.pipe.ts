import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'money',
})
export class MoneyPipe implements PipeTransform {
  constructor() {}

  transform(value: string | number): string {
    const number = Number(value);
    const isNegative = number < 0;
    const over1000 = Math.abs(number) >= 1000;
    let numberStr = Math.abs(number).toFixed(2);

    if (over1000) {
      numberStr = `${numberStr.slice(0, 1)},${numberStr.slice(1)}`;
    }

    numberStr = `${isNegative ? '-' : ''}$${numberStr}`;

    if (numberStr.endsWith('.00')) {
      return numberStr.slice(0, -3);
    }
    return numberStr;
  }
}
