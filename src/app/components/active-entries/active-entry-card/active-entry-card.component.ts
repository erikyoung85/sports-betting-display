import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UnderdogFantasyEntrySlip } from '../../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { AddUserToSlipComponent } from '../../add-user-to-slip/add-user-to-slip.component';

@Component({
  selector: 'app-active-entry-card',
  templateUrl: './active-entry-card.component.html',
  styleUrls: ['./active-entry-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveEntryCardComponent {
  constructor(private readonly dialog: MatDialog) {}

  @Input() slip!: UnderdogFantasyEntrySlip;
  @Input() showMoreButton = true;

  onMoreClicked(slip: UnderdogFantasyEntrySlip): void {
    this.dialog.open(AddUserToSlipComponent, { data: slip });
  }
}
