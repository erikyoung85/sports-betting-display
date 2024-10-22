import { keyBy } from 'lodash';
import { UnderdogFantasyGetActiveSlipsResponseDto } from '../dtos/underdog-fantasy-get-active-slips.response.dto';
import {
  IUnderdogFantasySelection,
  UnderdogFantasySelection,
} from './underdog-fantasy-selection.model';

export interface IUnderdogFantasyActiveSlip {
  id: string;
  initialMaxPayoutMultiplier: string;
  currentMaxPayoutMultiplier: string;
  fee: string;
  freeEntry: boolean;
  selections: IUnderdogFantasySelection[];
  status: string;
}

export class UnderdogFantasyActiveSlip {
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

  get maxPayout(): number {
    return this.fee * this.payoutMultiplier;
  }

  get status(): string {
    return this.props.status;
  }

  get freeEntry(): boolean {
    return this.props.freeEntry;
  }

  get selections(): UnderdogFantasySelection[] {
    return this._selections;
  }

  get selectionCount(): number {
    return this.selections.length;
  }

  constructor(private readonly props: IUnderdogFantasyActiveSlip) {
    this._selections = props.selections.map(
      (selection) => new UnderdogFantasySelection(selection)
    );
  }

  static fromDto(
    dto: UnderdogFantasyGetActiveSlipsResponseDto
  ): UnderdogFantasyActiveSlip[] {
    const playersDict = keyBy(dto.data.players, (player) => player.id);
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
      return new UnderdogFantasyActiveSlip({
        id: entrySlipDto.id,
        initialMaxPayoutMultiplier: entrySlipDto.initial_max_payout_multiplier,
        currentMaxPayoutMultiplier: entrySlipDto.current_max_payout_multiplier,
        fee: entrySlipDto.fee,
        freeEntry: entrySlipDto.free_entry,
        selections: entrySlipDto.selections.map((selectionDto) => {
          const option = optionsDict[selectionDto.option_id];
          const line = lineDict[option.over_under_line_id];
          const overUnder = overUnderDict[line.over_under_id];
          const appearance =
            appearanceDict[overUnder.appearance_stat.appearance_id];
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
            stat: overUnder.appearance_stat.stat,
            statDisplay: overUnder.appearance_stat.display_stat,
            statTargetValue: line.stat_value,
            statValue:
              appearance.stat_line?.data[overUnder.appearance_stat.stat] ??
              null,
            result: selectionDto.result,
          };
        }),
        status: entrySlipDto.status,
      });
    });
  }
}
