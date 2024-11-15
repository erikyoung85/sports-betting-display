import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { UnderdogFantasyEntrySlip } from '../../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasyService } from '../../../services/underdog-fantasy/underdog-fantasy.service';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-mobile-settled-entries',
  templateUrl: './mobile-settled-entries.component.html',
  styleUrls: ['./mobile-settled-entries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileSettledEntriesComponent {
  constructor(
    private readonly underdogFantasyService: UnderdogFantasyService,
    private readonly userService: UserService
  ) {}

  settledSlips$ = combineLatest([
    this.underdogFantasyService.settledSlipsByUsername$,
    this.userService.userDict$,
  ]).pipe(
    map(([settledSlipsByUsername, userDict]) => {
      const slips: UnderdogFantasyEntrySlip[] = [];
      Object.keys(settledSlipsByUsername).forEach((username) => {
        if (userDict[username].enabled) {
          slips.push(...(settledSlipsByUsername[username] ?? []));
        }
      });
      return slips.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    })
  );

  trackBySlipId(index: number, slip: UnderdogFantasyEntrySlip): string {
    return slip.id;
  }
}