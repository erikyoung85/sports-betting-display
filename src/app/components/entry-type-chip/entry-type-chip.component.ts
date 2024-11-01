import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { UnderdogFantasyEntrySlip } from '../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';

@Component({
  selector: 'app-entry-type-chip',
  templateUrl: './entry-type-chip.component.html',
  styleUrls: ['./entry-type-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryTypeChipComponent {
  constructor() {}

  @Input() slip!: UnderdogFantasyEntrySlip;
}
