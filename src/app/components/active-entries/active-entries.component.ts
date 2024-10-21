import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UnderdogFantasyService } from '../../services/underdog-fantasy/underdog-fantasy.service';

@Component({
  selector: 'app-active-entries',
  templateUrl: './active-entries.component.html',
  styleUrls: ['./active-entries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveEntriesComponent {
  constructor(
    private readonly underdogFantasyService: UnderdogFantasyService
  ) {}

  Number = Number;

  activeSlips$ = this.underdogFantasyService.getActiveSlips();
}
