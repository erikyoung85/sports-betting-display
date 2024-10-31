import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-loop-child',
  templateUrl: './loop-child.component.html',
  styleUrls: ['./loop-child.component.scss'],
})
export class LoopChildComponent {
  constructor(private elRef: ElementRef) {}
}
