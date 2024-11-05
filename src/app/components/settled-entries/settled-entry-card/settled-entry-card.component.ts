import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectionResult } from '../../../services/underdog-fantasy/enums/selection-result.enum';
import { UnderdogFantasyEntrySlip } from '../../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { AddUserToSlipComponent } from '../../add-user-to-slip/add-user-to-slip.component';

@Component({
  selector: 'app-settled-entry-card',
  templateUrl: './settled-entry-card.component.html',
  styleUrls: ['./settled-entry-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettledEntryCardComponent implements OnInit {
  constructor(private readonly dialog: MatDialog) {}

  @Input() slip!: UnderdogFantasyEntrySlip;
  @Input() forceExpansion = false;
  @Input() showMoreButton = true;

  isExpanded = false;

  SelectionResult = SelectionResult;

  ngOnInit(): void {
    if (this.forceExpansion) this.isExpanded = true;
  }

  onToggleSelectionExpansion(): void {
    if (!this.forceExpansion) this.isExpanded = !this.isExpanded;
  }

  onMoreClicked(event: MouseEvent, slip: UnderdogFantasyEntrySlip): void {
    event.stopPropagation();
    this.dialog.open(AddUserToSlipComponent, { data: slip });
  }
}
