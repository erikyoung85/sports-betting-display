import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SelectionResult } from '../../../../services/underdog-fantasy/enums/selection-result.enum';
import { UnderdogFantasySelection } from '../../../../services/underdog-fantasy/models/underdog-fantasy-selection.model';

@Component({
  selector: 'app-mobile-selection-card',
  templateUrl: './mobile-selection-card.component.html',
  styleUrls: ['./mobile-selection-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileSelectionCardComponent {
  constructor() {}

  @Input() selection!: UnderdogFantasySelection;

  SelectionResult = SelectionResult;
}
