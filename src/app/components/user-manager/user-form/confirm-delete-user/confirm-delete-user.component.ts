import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../../services/user/models/user.model';
import { UserService } from '../../../../services/user/user.service';

interface UnderdogLoginForm {
  username: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-confirm-delete-user',
  templateUrl: './confirm-delete-user.component.html',
  styleUrls: ['./confirm-delete-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDeleteUserComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteUserComponent>,
    private readonly userService: UserService,
    @Inject(MAT_DIALOG_DATA) public user: User
  ) {}

  passwordControl = new FormControl<string | null>(null, Validators.required);

  async onConfirm(): Promise<void> {
    if (!this.passwordControl.valid || !this.passwordControl.value) return;

    const response = await this.userService.removeUser(
      this.user,
      this.passwordControl.value
    );
    if (response instanceof Error) {
      this.passwordControl.setErrors({
        error: response.message,
      });
      return;
    }

    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
