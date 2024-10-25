import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { UnderdogFantasyService } from '../../../../services/underdog-fantasy/underdog-fantasy.service';
import { UnderdogUserInfo } from '../../../../services/user/models/user.model';

interface UnderdogLoginForm {
  username: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-underdog-login-form',
  templateUrl: './underdog-login-form.component.html',
  styleUrls: ['./underdog-login-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnderdogLoginFormComponent implements OnInit {
  constructor(private readonly underdogService: UnderdogFantasyService) {}

  @Input() loginInfo?: UnderdogUserInfo | undefined;
  @Output() onLoginInfoChange: EventEmitter<UnderdogUserInfo> =
    new EventEmitter();

  underdogUserInfo$ = new BehaviorSubject<UnderdogUserInfo | undefined>(
    undefined
  );
  underdogLoginStatusText$ = new BehaviorSubject<string | undefined>(undefined);
  editMode$ = new BehaviorSubject<boolean>(false);

  readonly loginForm = new FormGroup<UnderdogLoginForm>({
    username: new FormControl(
      this.loginInfo?.username ?? null,
      Validators.required
    ),
    password: new FormControl(null),
  });

  ngOnInit(): void {
    this.underdogUserInfo$.next(this.loginInfo);
    if (this.underdogUserInfo$.value?.token === undefined) {
      this.showForm();
    }
  }

  showForm(): void {
    this.loginForm.setValue({
      username: this.underdogUserInfo$.value?.username ?? null,
      password: null,
    });
    this.editMode$.next(true);
  }

  hideForm(): void {
    this.editMode$.next(false);
  }

  async onLoginToUnderdog(): Promise<void> {
    if (!this.loginForm.valid) {
      return;
    }

    const underdogUsername = this.loginForm.value.username;
    const underdogPassword = this.loginForm.value.password;

    if (underdogUsername && underdogPassword) {
      const authResponse = await this.underdogService.authWithPassword(
        underdogUsername,
        underdogPassword
      );
      if (authResponse instanceof Error) {
        this.underdogLoginStatusText$.next(authResponse.message);
      } else {
        this.underdogUserInfo$.next({
          username: underdogUsername,
          token: {
            accessToken: authResponse.access_token,
            refreshToken: authResponse.refresh_token,
            tokenExpirationDate: new Date(
              new Date().getTime() + authResponse.expires_in * 1000
            ).toISOString(),
          },
        });
        this.onLoginInfoChange.emit(this.underdogUserInfo$.value);
        this.hideForm();
      }
    }
  }

  onCancel(): void {
    this.hideForm();
  }
}
