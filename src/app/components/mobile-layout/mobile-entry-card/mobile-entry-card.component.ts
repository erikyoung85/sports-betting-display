import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { UnderdogFantasyEntrySlip } from '../../../services/underdog-fantasy/models/underdog-fantasy-entry-slip.model';

@Component({
  selector: 'app-mobile-entry-card',
  templateUrl: './mobile-entry-card.component.html',
  styleUrls: ['./mobile-entry-card.component.scss'],
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('200ms ease-out', style({ height: '*', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: '0', opacity: 0 })),
      ]),
    ]),
    trigger('rotate', [
      state('collapsed', style({ transform: 'rotate(-180deg)' })),
      state('expanded', style({ transform: 'rotate(0deg)' })),
      transition('collapsed <=> expanded', [animate('300ms ease-in-out')]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileEntryCardComponent implements OnInit {
  constructor() {}

  @Input() slip!: UnderdogFantasyEntrySlip;

  selectionNamesText: string = '';

  isExpanded = false;

  ngOnInit(): void {
    this.selectionNamesText = this.slip.selections
      .map((selection) => selection.player.lastName)
      .join(', ');
  }

  onToggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }
}
