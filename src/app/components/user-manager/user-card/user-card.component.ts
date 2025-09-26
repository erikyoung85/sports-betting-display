import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { UserStats } from '../../../services/user-stats/models/user-stats.model';
import { UserStatsService } from '../../../services/user-stats/user-stats.service';
import { User } from '../../../services/user/models/user.model';
import { UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent implements OnChanges {
  constructor(
    private readonly userStatsService: UserStatsService,
    private readonly userService: UserService,
    private readonly matIconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'crown_circle',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/crown_circle.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'sad_face',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/sad_face.svg')
    );
  }

  @Input() user!: User;
  @Input() elliotMode: boolean = false;

  private _elliotMode$ = new BehaviorSubject<boolean>(this.elliotMode);

  userStats$ = combineLatest([
    this.userStatsService.statsByUser$,
    this._elliotMode$,
  ]).pipe(
    map(([statsByUser, elliotMode]) => {
      if (elliotMode && this.user.username === 'elliotaustin') {
        return <UserStats>{
          ...statsByUser[this.user.username],
          numBetsWon: 100,
          numBetsLost: 0,
          totalProfit: 1000,
        };
      }
      return statsByUser[this.user.username];
    })
  );

  isStatLeader$ = this.userStatsService.statLeaders$.pipe(
    map((leaders) => leaders.includes(this.user?.username))
  );

  isStatLoser$ = this.userStatsService.statLosers$.pipe(
    map((losers) => losers.includes(this.user?.username))
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['elliotMode']) {
      this._elliotMode$.next(this.elliotMode);
    }
  }

  onToggleUser(): void {
    this.userService.toggleUserEnabled(this.user);
  }
}
