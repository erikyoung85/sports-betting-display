import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map } from 'rxjs';
import { EntryStatus } from '../../services/underdog-fantasy/enums/entry-status.enum';
import { UnderdogFantasyEntrySlip } from '../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasyService } from '../../services/underdog-fantasy/underdog-fantasy.service';
import { User } from '../../services/user/models/user.model';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-add-user-to-slip',
  templateUrl: './add-user-to-slip.component.html',
  styleUrls: ['./add-user-to-slip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserToSlipComponent {
  constructor(
    public dialogRef: MatDialogRef<AddUserToSlipComponent>,
    private readonly userService: UserService,
    private readonly underdogFantasyService: UnderdogFantasyService,
    @Inject(MAT_DIALOG_DATA) public slip: UnderdogFantasyEntrySlip
  ) {}

  allUsers$ = this.userService.users$;
  originalUsername$ = this.underdogFantasyService.slipToOriginalUser$.pipe(
    map((slipToUsers) => slipToUsers[this.slip.id].username)
  );
  selectedUsernames$ = this.underdogFantasyService.slipToUsers$.pipe(
    map((slipToUsers) => {
      const usersForSlip = slipToUsers[this.slip.id] ?? [];
      return new Set(usersForSlip.map((user) => user.username));
    })
  );

  disabled = false;

  EntryStatus = EntryStatus;

  async onUserSelectionChange(user: User, selected: boolean): Promise<void> {
    this.disabled = true;

    if (selected) {
      this.underdogFantasyService.addUserToSlip(this.slip.id, user.username);
    } else {
      this.underdogFantasyService.removeUserFromSlip(
        this.slip.id,
        user.username
      );
    }

    this.disabled = false;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
