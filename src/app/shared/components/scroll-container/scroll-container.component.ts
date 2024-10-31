// parent.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-scroll-container',
  templateUrl: './scroll-container.component.html',
  styleUrls: ['./scroll-container.component.scss'],
})
export class ScrollContainerComponent implements AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.startAutoScroll();
  }

  startAutoScroll() {
    const container = this.scrollContainer.nativeElement;

    // Calculate animation duration based on content width for smooth scrolling
    const contentWidth = container.scrollWidth;
    const containerWidth = container.clientWidth;
    const scrollDistance = contentWidth - containerWidth;
    const scrollDuration = (scrollDistance / 50) * 1000; // Adjust the speed by modifying 50

    // Apply CSS animation dynamically
    this.renderer.setStyle(
      container,
      'animation',
      `scroll ${scrollDuration}ms linear infinite`
    );
  }
}
