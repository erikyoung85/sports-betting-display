import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map } from 'rxjs';
import { UnderdogFantasyEntrySlip } from '../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasyService } from '../../services/underdog-fantasy/underdog-fantasy.service';
import { UserService } from '../../services/user/user.service';
import { AddUserToSlipComponent } from '../add-user-to-slip/add-user-to-slip.component';

@Component({
  selector: 'app-active-entries',
  templateUrl: './active-entries.component.html',
  styleUrls: ['./active-entries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveEntriesComponent {
  constructor(
    private readonly underdogFantasyService: UnderdogFantasyService,
    private readonly dialog: MatDialog,
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

  onMoreClicked(slip: UnderdogFantasyEntrySlip): void {
    this.dialog.open(AddUserToSlipComponent, { data: slip });
  }
}
