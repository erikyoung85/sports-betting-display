import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { isEqual } from 'lodash';
import { distinctUntilChanged, map, Observable, take } from 'rxjs';
import { TailedBetInfo } from '../../../services/underdog-fantasy/models/tailed-bet-info.model';
import { UnderdogFantasyEntrySlip } from '../../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasyService } from '../../../services/underdog-fantasy/underdog-fantasy.service';

@Component({
  selector: 'app-share-link-button',
  templateUrl: './share-link-button.component.html',
  styleUrls: ['./share-link-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareLinkButtonComponent implements OnInit {
  constructor(
    private readonly underdogFantasyService: UnderdogFantasyService
  ) {}

  @Input() slip!: UnderdogFantasyEntrySlip;
  @Input() fullWidth = false;

  shareLinkLoading = false;
  shareLinkErrorMsg: string | undefined = undefined;

  tailedBetInfo$!: Observable<TailedBetInfo | undefined>;

  ngOnInit(): void {
    this.tailedBetInfo$ = this.underdogFantasyService.tailedBetsDict$.pipe(
      map((tailedBetsDict) => tailedBetsDict[this.slip.id]),
      distinctUntilChanged((prev, curr) => isEqual(prev, curr))
    );
  }

  onTailBetClicked(): void {
    this.shareLinkErrorMsg = undefined;

    if (this.slip.shareLink !== undefined) {
      window.open(this.slip.shareLink, '_blank');
      return;
    }

    this.shareLinkLoading = true;
    this.underdogFantasyService.slipToOriginalUser$
      .pipe(take(1))
      .subscribe(async (slipToOriginalUser) => {
        const user = slipToOriginalUser[this.slip.id];
        const shareLinkResponse =
          await this.underdogFantasyService.getShareLink(user, this.slip.id);
        if (shareLinkResponse instanceof Error) {
          this.shareLinkErrorMsg = shareLinkResponse.message;
          return;
        }
        window.open(shareLinkResponse.share_link.url, '_blank');
        this.shareLinkLoading = false;
      });
  }
}
