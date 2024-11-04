import { keyBy } from 'lodash';
import { UnderdogFantasyGetActiveSlipsResponseDto } from '../dtos/underdog-fantasy-get-active-slips.response.dto';
import { UnderdogFantasyGetSettledSlipsResponseDto } from '../dtos/underdog-fantasy-get-settled-slips.response.dto';
import { EntryStatus } from '../enums/entry-status.enum';
import { EntryType } from '../enums/entry-type.enum';
import { SelectionResult } from '../enums/selection-result.enum';
import {
  IUnderdogFantasySelection,
  UnderdogFantasySelection,
} from './underdog-fantasy-selection.model';

export interface IUnderdogFantasyEntrySlip {
  id: string;
  initialMaxPayoutMultiplier: string;
  currentMaxPayoutMultiplier: string;
  fee: string;
  freeEntry: boolean;
  payout: string | null;
  boostPayout: string | null;
  selections: IUnderdogFantasySelection[];
  status: EntryStatus;
  createdAt: Date;
  shareLink: string | null;
  entryType: EntryType;
  insuranceFallbacks:
    | {
        current_max_payout_multiplier: string;
        initial_max_payout_multiplier: string;
        loss_count: number;
      }[]
    | null;
}

export class UnderdogFantasyEntrySlip {
  private _selections: UnderdogFantasySelection[];

  get id(): string {
    return this.props.id;
  }

  get payoutMultiplier(): number {
    return Number(this.props.currentMaxPayoutMultiplier);
  }

  get fee(): number {
    return Number(this.props.fee);
  }

  get freeEntry(): boolean {
    return this.props.freeEntry;
  }

  get maxPayout(): number {
    return this.fee * this.payoutMultiplier;
  }

  get result(): SelectionResult {
    if (this.status === EntryStatus.Settled) {
      return (this.resultPayout ?? 0) > 0
        ? SelectionResult.Won
        : SelectionResult.Lost;
    }

    return SelectionResult.Pending;
  }

  get resultPayout(): number | undefined {
    const payout = this.props.payout ? Number(this.props.payout) : undefined;
    const boostPayout = this.props.boostPayout
      ? Number(this.props.boostPayout)
      : undefined;
    return payout ? payout + (boostPayout ?? 0) : undefined;
  }

  get status(): EntryStatus {
    return this.props.status;
  }

  get selections(): UnderdogFantasySelection[] {
    return this._selections;
  }

  get selectionCount(): number {
    return this.selections.length;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get shareLink(): string | undefined {
    return this.props.shareLink ?? undefined;
  }

  get entryType(): EntryType {
    return this.props.entryType;
  }

  get insuranceFallbacks(): {
    initialMaxPayoutMultiplier: number;
    currentMaxPayoutMultiplier: number;
    lossCount: number;
  }[] {
    return (this.props.insuranceFallbacks ?? []).map((insuranceFallback) => ({
      initialMaxPayoutMultiplier: Number(
        insuranceFallback.initial_max_payout_multiplier
      ),
      currentMaxPayoutMultiplier: Number(
        insuranceFallback.current_max_payout_multiplier
      ),
      lossCount: insuranceFallback.loss_count,
    }));
  }

  get isFlexPlay(): boolean {
    return this.insuranceFallbacks.length > 0;
  }

  constructor(private readonly props: IUnderdogFantasyEntrySlip) {
    this._selections = props.selections
      .map((selection) => new UnderdogFantasySelection(selection))
      .sort((a, b) => a.player.id.localeCompare(b.player.id));
  }

  static fromDto(
    dto:
      | UnderdogFantasyGetActiveSlipsResponseDto
      | UnderdogFantasyGetSettledSlipsResponseDto
  ): UnderdogFantasyEntrySlip[] {
    const playersDict = keyBy(dto.data.players, (player) => player.id);
    const gamesDict = keyBy(dto.data.games, (game) => game.id);
    const appearanceDict = keyBy(
      dto.data.appearances,
      (appearance) => appearance.id
    );
    const overUnderDict = keyBy(
      dto.data.over_unders,
      (overUnder) => overUnder.id
    );
    const optionsDict = keyBy(
      dto.data.over_under_options,
      (option) => option.id
    );
    const lineDict = keyBy(dto.data.over_under_lines, (line) => line.id);

    return dto.data.entry_slips.map((entrySlipDto) => {
      return new UnderdogFantasyEntrySlip({
        id: entrySlipDto.id,
        initialMaxPayoutMultiplier: entrySlipDto.initial_max_payout_multiplier,
        currentMaxPayoutMultiplier: entrySlipDto.current_max_payout_multiplier,
        fee: entrySlipDto.fee,
        freeEntry: entrySlipDto.free_entry,
        payout: entrySlipDto.pickem_pool_entry?.payout ?? entrySlipDto.payout,
        boostPayout: entrySlipDto.boost_payout,
        selections: entrySlipDto.selections.map((selectionDto) => {
          const option = optionsDict[selectionDto.option_id];
          const line = lineDict[option.over_under_line_id];
          const overUnder = overUnderDict[line.over_under_id];
          const appearance =
            appearanceDict[overUnder.appearance_stat.appearance_id];
          const game = gamesDict[appearance.match_id];
          const player = playersDict[appearance.player_id];

          return {
            id: selectionDto.id,
            appearanceId: appearance.id,
            lineId: line.id,
            playerId: appearance.player_id,
            positionId: appearance.position_id,
            teamId: appearance.team_id,
            optionId: selectionDto.option_id,
            optionType: selectionDto.option_type,

            title: overUnder.title,
            player: {
              id: player.id,
              country: null,
              firstName: player.first_name,
              lastName: player.last_name,
              imageUrl: player.image_url,
              positionId: player.position_id,
              sportId: player.sport_id,
              teamId: player.team_id,
            },
            payoutMultiplier: selectionDto.payout_multiplier,

            choice: option.choice,
            choiceDisplay: option.choice_display,
            liveEvent: line.live_event,
            liveEventStat: line.live_event_stat,
            matchProgress: game?.match_progress,
            stat: overUnder.appearance_stat.stat,
            statDisplay: overUnder.appearance_stat.display_stat,
            statTargetValue:
              selectionDto.discounted_line_value ?? line.stat_value,
            statValue:
              appearance.stat_line?.data[overUnder.appearance_stat.stat] ??
              null,
            gradedBy: overUnder.appearance_stat.graded_by,
            result: selectionDto.result,
          };
        }),
        status: entrySlipDto.status,
        createdAt: new Date(entrySlipDto.selections[0].created_at),
        shareLink: entrySlipDto.share_link,
        entryType: entrySlipDto.type,
        insuranceFallbacks: entrySlipDto.insurance_fallbacks,
      });
    });
  }
}
