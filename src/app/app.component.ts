import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { UnderdogChangeDetectionService } from './services/underdog-fantasy/underdog-fantasy-change-detection.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'sports-betting-display';

  constructor(
    private readonly underdogChangeDetectionService: UnderdogChangeDetectionService,
    private readonly breakpointObserver: BreakpointObserver
  ) {}

  isMobileScreen = false;

  ngOnInit(): void {
    // initialize underdog change detection
    this.underdogChangeDetectionService.initChangeDetection();

    // screen size breakpoint observer
    this.breakpointObserver
      .observe([Breakpoints.HandsetLandscape, Breakpoints.HandsetPortrait])
      .subscribe((result) => {
        if (result.matches) {
          this.isMobileScreen = true;
        }
      });
  }
}
