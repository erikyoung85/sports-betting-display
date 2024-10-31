import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { map, Observable, of, take } from 'rxjs';
import {
  UnderdogUserInfo,
  User,
} from '../../../services/user/models/user.model';
import { UserService } from '../../../services/user/user.service';
import { ConfirmDeleteUserComponent } from './confirm-delete-user/confirm-delete-user.component';

interface UserForm {
  username: FormControl<string | null>;
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
}

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFormComponent {
  constructor(
    public dialogRef: MatDialogRef<UserFormComponent>,
    private readonly userService: UserService,
    private readonly dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public user?: User
  ) {}

  editMode = !!this.user;

  userForm = new FormGroup<UserForm>({
    firstName: new FormControl(
      this.user?.firstName ?? null,
      Validators.required
    ),
    lastName: new FormControl(this.user?.lastName ?? null, Validators.required),
    username: new FormControl(
      { value: this.user?.username ?? null, disabled: this.editMode },
      Validators.required,
      this.usernameValidator()
    ),
  });

  underdogUserInfo: UnderdogUserInfo | undefined = this.user?.underdogUserInfo;

  usernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null); // No validation if empty
      }

      return this.userService.userDict$.pipe(
        take(1),
        map((userDict) => {
          if (userDict[control.value]) {
            return { usernameTaken: true }; // Invalid if username is taken
          } else {
            return null; // Valid if username is available
          }
        })
      );
    };
  }

  onUnderdogLoginInfoChange(loginInfo: UnderdogUserInfo) {
    this.underdogUserInfo = loginInfo;
  }

  onSaveUser(): void {
    if (!this.userForm.valid) {
      return;
    }

    const user: User = {
      ...(this.user ?? {}),
      username:
        this.editMode && this.user?.username
          ? this.user.username
          : this.userForm.value.username ?? '',
      firstName: this.userForm.value.firstName ?? '',
      lastName: this.userForm.value.lastName ?? '',
      enabled: true,
      underdogUserInfo: this.underdogUserInfo
        ? {
            username: this.underdogUserInfo.username ?? '',
            authError: this.underdogUserInfo.authError,
            token: this.underdogUserInfo.token
              ? {
                  accessToken: this.underdogUserInfo.token.accessToken,
                  refreshToken: this.underdogUserInfo.token.refreshToken,
                  tokenExpirationDate:
                    this.underdogUserInfo.token.tokenExpirationDate,
                }
              : undefined,
          }
        : undefined,
    };

    this.userService.setUser(user);
    this.dialogRef.close(this.userForm.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDeleteUser(): void {
    if (this.user) {
      const dialogRef = this.dialog.open(ConfirmDeleteUserComponent, {
        data: this.user,
      });
      dialogRef.afterClosed().subscribe((result: boolean) => {
        if (result === true) {
          this.dialogRef.close(this.userForm.value);
        }
      });
    }
  }
}
