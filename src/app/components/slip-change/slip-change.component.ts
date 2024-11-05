import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { EntryStatus } from '../../services/underdog-fantasy/enums/entry-status.enum';
import { SelectionResult } from '../../services/underdog-fantasy/enums/selection-result.enum';
import {
  SlipChange,
  SlipChangeType,
} from '../../services/underdog-fantasy/underdog-fantasy-change-detection.service';

@Component({
  selector: 'app-slip-change',
  templateUrl: './slip-change.component.html',
  styleUrls: ['./slip-change.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlipChangeComponent implements OnInit, OnDestroy {
  constructor() {}

  @Input() slipChange!: SlipChange;
  private audio?: HTMLAudioElement | undefined;

  SlipChangeType = SlipChangeType;
  SelectionResult = SelectionResult;
  EntryStatus = EntryStatus;

  ngOnInit(): void {
    if (this.slipChange.newStatus === SelectionResult.Won) {
      this.audio = this.playCheeringAudio();
    }
    if (this.slipChange.newStatus === SelectionResult.Lost) {
      this.audio = this.playBooingAudio();
    }
  }

  ngOnDestroy(): void {
    this.audio?.pause();
  }

  playCheeringAudio(): HTMLAudioElement {
    const audio = new Audio();
    audio.src = '../assets/funny-shout-cheering.ogg';
    audio.load();
    audio.play();
    return audio;
  }

  playBooingAudio(): HTMLAudioElement {
    const audio = new Audio();
    audio.src = '../assets/funny-booing.flac';
    audio.load();
    audio.play();
    return audio;
  }
}
