import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map } from 'rxjs';
import { EntryStatus } from 'src/app/services/underdog-fantasy/enums/entry-status.enum';
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

  autoScroll = signal(false);

  activeSlips$ = combineLatest([
    this.underdogFantasyService.activeSlipsByUsername$,
    this.userService.userDict$,
  ]).pipe(
    map(([activeSlipsByUsername, userDict]) => {
      const slips: UnderdogFantasyEntrySlip[] = [];
      Object.keys(activeSlipsByUsername).forEach((username) => {
        if (userDict[username].enabled) {
          const userSlips = (activeSlipsByUsername[username] ?? []).filter(
            (slip) => slip.status === EntryStatus.Active
          );
          slips.push(...userSlips);
        }
      });
      return slips.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    })
  );

  onAutoScrollToggleChange(): void {
    this.autoScroll.update((currValue) => !currValue);
  }

  onMoreClicked(slip: UnderdogFantasyEntrySlip): void {
    this.dialog.open(AddUserToSlipComponent, { data: slip });
  }

  trackBySlipId(index: number, slip: UnderdogFantasyEntrySlip): string {
    return slip.id;
  }
}
