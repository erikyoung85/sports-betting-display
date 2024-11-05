import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SelectionResult } from '../../../services/underdog-fantasy/enums/selection-result.enum';
import { UnderdogFantasySelection } from '../../../services/underdog-fantasy/models/underdog-fantasy-selection.model';

@Component({
  selector: 'app-selection-row',
  templateUrl: './selection-row.component.html',
  styleUrls: ['./selection-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectionRowComponent {
  constructor() {}

  @Input() selection!: UnderdogFantasySelection;
  @Input() elevated = false;

  SelectionResult = SelectionResult;
}
