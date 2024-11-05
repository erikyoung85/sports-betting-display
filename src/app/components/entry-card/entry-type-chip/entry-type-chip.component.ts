import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { EntryType } from '../../../services/underdog-fantasy/enums/entry-type.enum';
import { UnderdogFantasyEntrySlip } from '../../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';

enum EntryTypeOptions {
  Power = 'Power',
  Flex = 'Flex',
  Streak = 'Streak',
}

@Component({
  selector: 'app-entry-type-chip',
  templateUrl: './entry-type-chip.component.html',
  styleUrls: ['./entry-type-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryTypeChipComponent implements OnInit {
  constructor() {}

  @Input() slip!: UnderdogFantasyEntrySlip;

  entryTypeOption!: EntryTypeOptions;

  EntryTypeOptions = EntryTypeOptions;

  ngOnInit(): void {
    this.entryTypeOption =
      this.slip.entryType === EntryType.Classic
        ? this.slip.isFlexPlay
          ? EntryTypeOptions.Flex
          : EntryTypeOptions.Power
        : EntryTypeOptions.Streak;
  }
}
