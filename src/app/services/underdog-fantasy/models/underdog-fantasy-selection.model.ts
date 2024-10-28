import { EntryOptionType } from '../enums/entry-option-type.enum';
import { SelectionResult } from '../enums/selection-result.enum';
import { UnderdogFantasyPlayer } from './underdog-fantasy-player.model';

export interface IUnderdogFantasySelection {
  id: string;
  optionId: string;
  optionType: EntryOptionType;
  appearanceId: string;
  lineId: string;
  playerId: string;
  positionId: string;
  teamId: string;
  title: string;
  player: UnderdogFantasyPlayer;
  payoutMultiplier: string;
  choice: 'higher' | 'lower';
  choiceDisplay: string;
  liveEvent: boolean;
  liveEventStat: string | null;
  matchProgress: string;
  stat: string;
  statDisplay: string;
  statTargetValue: string;
  statValue: string | null;
  result: SelectionResult;
}

export class UnderdogFantasySelection {
  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get player(): UnderdogFantasyPlayer {
    return this.props.player;
  }

  get playerName(): string {
    return `${this.props.player.firstName} ${this.props.player.lastName}`;
  }

  get payoutMultiplier(): number {
    return Number(this.props.payoutMultiplier);
  }

  get choice(): 'higher' | 'lower' {
    return this.props.choice;
  }

  get choiceDisplay(): string {
    return this.props.choiceDisplay;
  }

  get liveEvent(): boolean {
    return this.props.liveEvent;
  }

  get liveEventStat(): number | null {
    return this.props.liveEventStat ? Number(this.props.liveEventStat) : null;
  }

  get matchProgress(): string {
    return this.props.matchProgress;
  }

  get stat(): string {
    return this.props.stat;
  }

  get statDisplay(): string {
    return this.props.statDisplay;
  }

  get statTargetValue(): number {
    return Number(this.props.statTargetValue);
  }

  get statValue(): number {
    return this.props.statValue ? Number(this.props.statValue) : 0;
  }

  get progressValue(): number {
    return (this.statValue / this.statTargetValue) * 100;
  }

  get result(): SelectionResult {
    return this.props.result;
  }

  constructor(private readonly props: IUnderdogFantasySelection) {}
}
