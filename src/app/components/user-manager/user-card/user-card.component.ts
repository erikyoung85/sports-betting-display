import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { map } from 'rxjs';
import { UserStatsService } from '../../../services/user-stats/user-stats.service';
import { User } from '../../../services/user/models/user.model';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  constructor(private readonly userStatsService: UserStatsService) {}

  @Input() user!: User;

  userStats$ = this.userStatsService.statsByUser$.pipe(
    map((statsByUser) => statsByUser[this.user.username])
  );
}
