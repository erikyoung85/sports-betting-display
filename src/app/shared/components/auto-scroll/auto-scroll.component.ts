import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';
import { AutoScrollDirectiveDirective } from '../../directives/auto-scroll-directive.directive';

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
  @ContentChild(AutoScrollDirectiveDirective, { read: TemplateRef })
  transcludeTemplate!: TemplateRef<HTMLElement>;

  @Input() autoScrollEnabled = true;

  _numCopies$ = new BehaviorSubject<number>(0);
  numCopies$ = this._numCopies$.asObservable().pipe(distinctUntilChanged());

  private autoScrollStarted = false;
  private scrollInterval: any;

  ngAfterViewInit(): void {
    if (this.autoScrollEnabled) this.startAutoScroll();
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['autoScrollEnabled'] &&
      !changes['autoScrollEnabled'].isFirstChange()
    ) {
      if (this.autoScrollEnabled) {
        this.startAutoScroll();
      } else {
        this.stopAutoScroll();
      }
    }
  }

  calcAndResize() {
    this._numCopies$.next(this.autoScrollEnabled ? this.getNumCopies() : 0);
  }

  startAutoScroll() {
    if (this.autoScrollStarted) {
      return;
    }
    this.autoScrollStarted = true;

    const container = this.scrollContainer.nativeElement;

    this.scrollInterval = setInterval(() => {
      this.calcAndResize();

      // Check if we've reached the end of the scroll container
      const numCopies = this._numCopies$.value;
      if (
        numCopies > 0 &&
        container.scrollLeft >= container.scrollWidth / (numCopies + 1)
      ) {
        container.scrollLeft = 0; // Reset to start
      } else {
        container.scrollLeft += SCROLL_AMOUNT; // Scroll by a small amount
      }
    }, 16); // 60 frames per second
  }

  stopAutoScroll() {
    this.autoScrollStarted = false;

    this.calcAndResize();
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }
  }

  getNumCopies(): number {
    const containerWidth = this.scrollContainer.nativeElement.offsetWidth;
    const elementWidth =
      this.scrollContainer.nativeElement.children?.[0]?.offsetWidth ??
      containerWidth;

    if (elementWidth <= containerWidth) return 0;

    return 1;
  }
}
