import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { UnderdogFantasyService } from '../../services/underdog-fantasy/underdog-fantasy.service';

@Component({
  selector: 'app-active-entries',
  templateUrl: './active-entries.component.html',
  styleUrls: ['./active-entries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveEntriesComponent implements OnInit {
  constructor(
    private readonly underdogFantasyService: UnderdogFantasyService
  ) {}

  activeSlips$ = this.underdogFantasyService.activeSlipsByUsername$.pipe(
    map((activeSlipsByUsername) => {
      return activeSlipsByUsername['young.erik22@gmail.com'];
    })
  );

  ngOnInit(): void {
    this.underdogFantasyService.getActiveSlips();
  }
}
