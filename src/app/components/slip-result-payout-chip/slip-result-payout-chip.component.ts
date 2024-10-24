import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SelectionResult } from '../../services/underdog-fantasy/enums/selection-result.enum';
import { UnderdogFantasyEntrySlip } from '../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';

@Component({
  selector: 'app-slip-result-payout-chip',
  templateUrl: './slip-result-payout-chip.component.html',
  styleUrls: ['./slip-result-payout-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlipResultPayoutChipComponent {
  constructor() {}

  @Input() slip!: UnderdogFantasyEntrySlip;

  SelectionResult = SelectionResult;
}
