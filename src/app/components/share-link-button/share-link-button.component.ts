import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { take } from 'rxjs';
import { UnderdogFantasyEntrySlip } from '../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasyService } from '../../services/underdog-fantasy/underdog-fantasy.service';

@Component({
  selector: 'app-share-link-button',
  templateUrl: './share-link-button.component.html',
  styleUrls: ['./share-link-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareLinkButtonComponent {
  constructor(
    private readonly underdogFantasyService: UnderdogFantasyService
  ) {}

  @Input() slip!: UnderdogFantasyEntrySlip;

  shareLinkLoading = false;
  shareLinkErrorMsg: string | undefined = undefined;

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
