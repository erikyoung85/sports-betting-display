import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, map, tap } from 'rxjs';
import { SelectionResult } from '../../services/underdog-fantasy/enums/selection-result.enum';
import { UnderdogFantasyEntrySlip } from '../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasyService } from '../../services/underdog-fantasy/underdog-fantasy.service';
import { UserService } from '../../services/user/user.service';
import { AddUserToSlipComponent } from '../add-user-to-slip/add-user-to-slip.component';

@Component({
  selector: 'app-settled-entries',
  templateUrl: './settled-entries.component.html',
  styleUrls: ['./settled-entries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettledEntriesComponent {
  constructor(
    private readonly underdogFantasyService: UnderdogFantasyService,
    private readonly dialog: MatDialog,
    private readonly userService: UserService
  ) {}

  slipExpansionState: { [slipId: string]: boolean } = {};
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
    }),
    tap((slips) => {
      (slips ?? []).forEach((slip) => {
        this.slipExpansionState[slip.id] =
          this.slipExpansionState[slip.id] ?? false;
      });
    })
  );

  SelectionResult = SelectionResult;

  onToggleSelectionExpansion(slip: UnderdogFantasyEntrySlip): void {
    this.slipExpansionState[slip.id] = !this.slipExpansionState[slip.id];
  }

  onMoreClicked(event: MouseEvent, slip: UnderdogFantasyEntrySlip): void {
    event.stopPropagation();
    this.dialog.open(AddUserToSlipComponent, { data: slip });
  }
}
