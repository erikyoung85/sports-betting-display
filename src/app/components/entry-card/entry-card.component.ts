import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EntryStatus } from '../../services/underdog-fantasy/enums/entry-status.enum';
import { UnderdogFantasyEntrySlip } from '../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { SelectionResultChange } from '../../services/underdog-fantasy/underdog-fantasy-change-detection.service';

@Component({
  selector: 'app-entry-card',
  templateUrl: './entry-card.component.html',
  styleUrls: ['./entry-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryCardComponent {
  constructor() {}

  @Input() slip!: UnderdogFantasyEntrySlip;
  @Input() showMoreButton = true;
  @Input() forceExpansion = true;
  @Input() selectionResultChange?: SelectionResultChange;

  EntryStatus = EntryStatus;
}
