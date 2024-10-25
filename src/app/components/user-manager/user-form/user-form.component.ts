import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { map, Observable, of, take } from 'rxjs';
import { UnderdogFantasyAuthenticateResponseDto } from '../../../services/underdog-fantasy/dtos/underdog-fantasy-authenticate.response.dto';
import { UnderdogFantasyService } from '../../../services/underdog-fantasy/underdog-fantasy.service';
import { User } from '../../../services/user/models/user.model';
import { UserService } from '../../../services/user/user.service';

interface UserForm {
  username: FormControl<string | null>;
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
  underdogUsername: FormControl<string | null>;
  underdogPassword: FormControl<string | null>;
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
    private readonly underdogService: UnderdogFantasyService,
    @Inject(MAT_DIALOG_DATA) public user?: User
  ) {}

  editMode = !!this.user;

  underdogLoginText: string | undefined;
  underdogToken: UnderdogFantasyAuthenticateResponseDto | undefined;

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
    underdogUsername: new FormControl(
      this.user?.underdogUserInfo?.username ?? null,
      [Validators.email]
    ),
    underdogPassword: new FormControl(
      this.user?.underdogUserInfo?.password ?? null
    ),
  });

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
      underdogUserInfo: {
        ...(this.user?.underdogUserInfo ?? {}),
        username: this.userForm.value.underdogUsername ?? '',
        password: this.userForm.value.underdogPassword ?? '',
        token: this.underdogToken
          ? {
              accessToken: this.underdogToken.access_token,
              refreshToken: this.underdogToken.refresh_token,
              tokenExpirationDate: new Date(
                new Date().getTime() + this.underdogToken.expires_in * 1000
              ).toISOString(),
            }
          : undefined,
      },
    };

    this.userService.setUser(user);
    this.dialogRef.close(this.userForm.value);
  }

  async onLoginToUnderdog(): Promise<void> {
    const underdogUsername = this.userForm.value.underdogUsername;
    const underdogPassword = this.userForm.value.underdogPassword;

    if (underdogUsername && underdogPassword) {
      const authResponse = await this.underdogService.authWithPassword(
        underdogUsername,
        underdogPassword
      );
      if (authResponse instanceof Error) {
        this.underdogToken = undefined;
        this.underdogLoginText = authResponse.message;
      } else {
        this.underdogToken = authResponse;
        this.underdogLoginText = 'Login successful!';
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDeleteUser(): void {
    if (this.user) {
      this.userService.removeUser(this.user);
      this.dialogRef.close(this.userForm.value);
    }
  }
}
