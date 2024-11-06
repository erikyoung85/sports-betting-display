import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { UnderdogFantasyEntrySlip } from '../../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasyService } from '../../../services/underdog-fantasy/underdog-fantasy.service';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-mobile-active-entries',
  templateUrl: './mobile-active-entries.component.html',
  styleUrls: ['./mobile-active-entries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileActiveEntriesComponent {
  constructor(
    private readonly underdogFantasyService: UnderdogFantasyService,
    private readonly userService: UserService
  ) {}

  activeSlips$ = combineLatest([
    this.underdogFantasyService.activeSlipsByUsername$,
    this.userService.userDict$,
  ]).pipe(
    map(([activeSlipsByUsername, userDict]) => {
      const slips: UnderdogFantasyEntrySlip[] = [];
      Object.keys(activeSlipsByUsername).forEach((username) => {
        if (userDict[username].enabled) {
          slips.push(...(activeSlipsByUsername[username] ?? []));
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
