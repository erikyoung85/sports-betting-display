import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-mobile-user-manager',
  templateUrl: './mobile-user-manager.component.html',
  styleUrls: ['./mobile-user-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileUserManagerComponent {
  constructor(private readonly userService: UserService) {}

  users$ = this.userService.users$;
}
