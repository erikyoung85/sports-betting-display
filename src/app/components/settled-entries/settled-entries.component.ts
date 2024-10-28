import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { map, tap } from 'rxjs';
import { SelectionResult } from '../../services/underdog-fantasy/enums/selection-result.enum';
import { UnderdogFantasyEntrySlip } from '../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasyService } from '../../services/underdog-fantasy/underdog-fantasy.service';
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
    private readonly dialog: MatDialog
  ) {}

  slipExpansionState: { [slipId: string]: boolean } = {};
  settledSlips$ = this.underdogFantasyService.settledSlipsByUsername$.pipe(
    map((settledSlipsByUsername) =>
      Object.values(settledSlipsByUsername)
        .flatMap((slips) => slips ?? [])
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    ),
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

  onMoreClicked(slip: UnderdogFantasyEntrySlip): void {
    this.dialog.open(AddUserToSlipComponent, { data: slip });
  }
}
