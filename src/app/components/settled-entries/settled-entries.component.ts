import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { map, tap } from 'rxjs';
import { SelectionResult } from '../../services/underdog-fantasy/enums/selection-result.enum';
import { UnderdogFantasyEntrySlip } from '../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasyService } from '../../services/underdog-fantasy/underdog-fantasy.service';

@Component({
  selector: 'app-settled-entries',
  templateUrl: './settled-entries.component.html',
  styleUrls: ['./settled-entries.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettledEntriesComponent implements OnInit {
  constructor(
    private readonly underdogFantasyService: UnderdogFantasyService
  ) {}

  slipExpansionState: { [slipId: string]: boolean } = {};
  settledSlips$ = this.underdogFantasyService.settledSlipsByUsername$.pipe(
    map((settledSlipsByUsername) =>
      Object.values(settledSlipsByUsername).flatMap((slips) => slips ?? [])
    ),
    tap((slips) => {
      (slips ?? []).forEach((slip) => {
        this.slipExpansionState[slip.id] = false;
      });
    })
  );

  SelectionResult = SelectionResult;

  onToggleSelectionExpansion(slip: UnderdogFantasyEntrySlip): void {
    this.slipExpansionState[slip.id] = !this.slipExpansionState[slip.id];
  }

  ngOnInit(): void {
    this.underdogFantasyService.getSettledSlips();
  }
}
