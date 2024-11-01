import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { interval, map, withLatestFrom } from 'rxjs';
import { UnderdogFantasyService } from '../../services/underdog-fantasy/underdog-fantasy.service';
import { User } from '../../services/user/models/user.model';
import { UserService } from '../../services/user/user.service';
import { UserFormComponent } from './user-form/user-form.component';

enum CardAlignment {
  Left = 'left',
  Right = 'right',
}

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrls: ['./user-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagerComponent {
  constructor(
    private readonly dialog: MatDialog,
    private readonly userService: UserService,
    private readonly underdogFantasyService: UnderdogFantasyService
  ) {}

  users$ = this.userService.users$;

  dataLastUpdatedOn$ = this.underdogFantasyService.dataLastUpdated$;
  secondsUpdatedAgo$ = interval(1000).pipe(
    withLatestFrom(this.underdogFantasyService.dataLastUpdated$),
    map(([_, dataUpdatedOn]) =>
      Math.floor((new Date().getTime() - dataUpdatedOn.getTime()) / 1000)
    )
  );

  CardAlignment = CardAlignment;
  selectedCardAlignment = new FormControl<CardAlignment>(CardAlignment.Left);

  onAddUser(): void {
    this.dialog.open(UserFormComponent);
  }

  onCardClick(user: User) {
    this.dialog.open(UserFormComponent, { data: user });
  }
}
