import { Component, OnInit } from '@angular/core';
import { PrizePicksService } from './services/prize-picks/prize-picks.service';
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
    private readonly prizePicksService: PrizePicksService
  ) {}

  ngOnInit(): void {
    this.underdogChangeDetectionService.initChangeDetection();
    this.prizePicksService.test();
  }
}
