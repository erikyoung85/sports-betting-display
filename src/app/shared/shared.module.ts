import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Loop2Component } from './components/loop-2/loop-2.component';
import { LoopComponent } from './components/loop/loop.component';
import { ScrollChildComponent } from './components/scroll-child/scroll-child.component';
import { ScrollContainerComponent } from './components/scroll-container/scroll-container.component';
import { MoneyPipe } from './pipes/money.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    MoneyPipe,
    ScrollContainerComponent,
    ScrollChildComponent,
    LoopComponent,
    Loop2Component,
  ],
  exports: [
    MoneyPipe,
    ScrollContainerComponent,
    ScrollChildComponent,
    LoopComponent,
    Loop2Component,
  ],
})
export class SharedModule {}
