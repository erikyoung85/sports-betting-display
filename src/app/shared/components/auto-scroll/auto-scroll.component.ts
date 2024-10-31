import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

const SCROLL_AMOUNT = 1;

@Component({
  selector: 'app-auto-scroll',
  templateUrl: './auto-scroll.component.html',
  styleUrls: ['./auto-scroll.component.scss'],
})
export class AutoScrollComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;

  @Input() autoScrollEnabled = true;

  private autoScrollStarted = false;
  private scrollInterval: any;

  ngAfterViewInit(): void {
    this.startAutoScroll();
  }

  ngOnDestroy() {
    // Clear interval when the component is destroyed
    this.stopAutoScroll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['autoScrollEnabled']) {
      if (this.autoScrollEnabled) {
        this.startAutoScroll();
      } else {
        this.stopAutoScroll();
      }
    }
  }

  startAutoScroll() {
    if (this.autoScrollStarted) {
      return;
    }
    this.autoScrollStarted = true;

    const container = this.scrollContainer.nativeElement;

    this.scrollInterval = setInterval(() => {
      // Check if we've reached the end of the scroll container
      if (
        container.scrollLeft + container.clientWidth >=
        container.scrollWidth
      ) {
        container.scrollLeft = 0; // Reset to start
      } else {
        container.scrollLeft += SCROLL_AMOUNT; // Scroll by a small amount
      }
    }, 16); // 60 frames per second
  }

  stopAutoScroll() {
    this.autoScrollStarted = false;

    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }
}
