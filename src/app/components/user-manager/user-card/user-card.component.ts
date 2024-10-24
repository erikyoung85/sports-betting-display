import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { User } from '../../../services/user/models/user.model';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  constructor() {}

  @Input() user!: User;
}
