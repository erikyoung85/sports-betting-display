import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SelectionResult } from '../../services/underdog-fantasy/enums/selection-result.enum';
import {
  SlipChange,
  SlipChangeType,
} from '../../services/underdog-fantasy/underdog-fantasy-change-detection.service';

@Component({
  selector: 'app-slip-change',
  templateUrl: './slip-change.component.html',
  styleUrls: ['./slip-change.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlipChangeComponent {
  constructor() {}

  @Input() slipChange!: SlipChange;

  SlipChangeType = SlipChangeType;
  SelectionResult = SelectionResult;
}
