import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MoneyPipe } from './pipes/money.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [MoneyPipe],
  exports: [MoneyPipe],
})
export class SharedModule {}
