import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../services/user/models/user.model';
import { UserService } from '../../services/user/user.service';
import { UserFormComponent } from './user-form/user-form.component';

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagerComponent {
  constructor(
    private readonly dialog: MatDialog,
    private readonly userService: UserService
  ) {}

  users$ = this.userService.users$;

  onAddUser(): void {
    this.dialog.open(UserFormComponent);
  }

  onCardClick(user: User) {
    this.dialog.open(UserFormComponent, { data: user });
  }
}
