import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AutoScrollComponent } from './components/auto-scroll/auto-scroll.component';
import { AutoScrollDirectiveDirective } from './directives/auto-scroll-directive.directive';
import { MoneyPipe } from './pipes/money.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [MoneyPipe, AutoScrollComponent, AutoScrollDirectiveDirective],
  exports: [MoneyPipe, AutoScrollComponent, AutoScrollDirectiveDirective],
})
export class SharedModule {}
