import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { map } from 'rxjs';
import { UnderdogFantasyEntrySlip } from '../../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasyService } from '../../../services/underdog-fantasy/underdog-fantasy.service';

@Component({
  selector: 'app-slip-user-chips',
  templateUrl: './slip-user-chips.component.html',
  styleUrls: ['./slip-user-chips.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlipUserChipsComponent {
  constructor(
    private readonly underdogFantasyService: UnderdogFantasyService
  ) {}

  @Input() slip!: UnderdogFantasyEntrySlip;

  users$ = this.underdogFantasyService.slipToUsers$.pipe(
    map((slipToUsers) => {
      return slipToUsers[this.slip.id] ?? [];
    })
  );
}
