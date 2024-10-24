import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SelectionResult } from '../../services/underdog-fantasy/enums/selection-result.enum';
import { UnderdogFantasySelection } from '../../services/underdog-fantasy/models/underdog-fantasy-selection.model';

@Component({
  selector: 'app-selection-status-icon',
  templateUrl: './selection-status-icon.component.html',
  styleUrls: ['./selection-status-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionStatusIconComponent {
  constructor() {}

  @Input() selection!: UnderdogFantasySelection;

  SelectionResult = SelectionResult;
}
