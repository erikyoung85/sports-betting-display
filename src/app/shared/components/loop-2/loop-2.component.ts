import { AfterViewInit, Component, ElementRef } from '@angular/core';

@Component({
  selector: 'app-loop-2',
  templateUrl: './loop-2.component.html',
  styleUrls: ['./loop-2.component.scss'],
})
export class Loop2Component implements AfterViewInit {
  private context!: HTMLElement;
  private clones!: NodeListOf<HTMLElement>;
  private disableScroll = false;
  private scrollWidth = 0;
  private scrollPos = 0;
  private clonesWidth = 0;
  private fpsInterval = 1000 / 120; // 120 fps
  private then!: number;

  constructor(private elRef: ElementRef) {}

  ngAfterViewInit(): void {
    this.context = this.elRef.nativeElement.querySelector('.js-loop');
    this.context.onresize;
    this.clones = this.context.querySelectorAll('.is-clone');
    this.initializeScroll();
    window.requestAnimationFrame(this.reCalc.bind(this));
    this.context.addEventListener('scroll', () =>
      window.requestAnimationFrame(this.scrollUpdate.bind(this))
    );
    window.addEventListener('resize', () =>
      window.requestAnimationFrame(this.reCalc.bind(this))
    );
    this.startScrolling();
  }

  private initializeScroll() {
    this.setScrollPos(
      Math.round(
        this.clones[0].getBoundingClientRect().left +
          this.getScrollPos() -
          (this.context.offsetWidth - this.clones[0].offsetWidth) / 2
      )
    );
  }

  private getScrollPos(): number {
    return (this.context.scrollLeft || 0) - (this.context.clientLeft || 0);
  }

  private setScrollPos(pos: number): void {
    this.context.scrollLeft = pos;
  }

  private getClonesWidth(): number {
    let width = 0;
    this.clones.forEach((clone) => (width += clone.offsetWidth));
    return width;
  }

  private reCalc(): void {
    this.scrollPos = this.getScrollPos();
    this.scrollWidth = this.context.scrollWidth;
    this.clonesWidth = this.getClonesWidth();

    if (this.scrollPos <= 0) {
      this.setScrollPos(1);
    }
  }

  private scrollUpdate(): void {
    if (!this.disableScroll) {
      this.scrollPos = this.getScrollPos();
      if (this.clonesWidth + this.scrollPos >= this.scrollWidth) {
        this.setScrollPos(1);
        this.disableScroll = true;
      } else if (this.scrollPos <= 0) {
        this.setScrollPos(this.scrollWidth - this.clonesWidth);
        this.disableScroll = true;
      }
    }

    if (this.disableScroll) {
      setTimeout(() => (this.disableScroll = false), 40);
    }
  }

  private startScrolling(): void {
    this.then = window.performance.now();
    this.animate();
  }

  private animate(newTime?: number): void {
    window.requestAnimationFrame(this.animate.bind(this));
    const now = newTime || window.performance.now();
    const elapsed = now - this.then;

    if (elapsed > this.fpsInterval) {
      this.then = now - (elapsed % this.fpsInterval);
      if (this.scrollPos > 2) {
        // this.setScrollPos(this.getScrollPos() + 1);
      }
    }
  }
}
