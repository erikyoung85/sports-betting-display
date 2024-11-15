import { EntryOptionType } from '../enums/entry-option-type.enum';
import { EntryStatus } from '../enums/entry-status.enum';
import { EntryType } from '../enums/entry-type.enum';
import { GameStatus } from '../enums/game-status.enum';
import { GradedBy } from '../enums/graded-by.enum';
import { LineType } from '../enums/line-type.enum';
import { MatchType } from '../enums/match-type.enum';
import { OwnerType } from '../enums/owner-type.enum';
import { SeasonType } from '../enums/season-type.enum';
import { SelectionResult } from '../enums/selection-result.enum';
import { SportType } from '../enums/sport-type.enum';
import { UnderdogFantasyGetActiveSlipsResponseDto } from './underdog-fantasy-get-active-slips.response.dto';

export interface UnderdogFantasyGetSettledSlipsResponseDto {
  data: {
    appearances: {
      id: string;
      badges: {
        icon: null;
        text: string;
        label: string;
        value: string;
      }[];
      lineup_status_id: string | null;
      match_id: number;
      match_type: MatchType;
      player_id: string;
      position_id: string;
      stat_line: {
        id: number;
        data: { [stat: string]: string };
        owner_id: string;
        owner_type: OwnerType;
        scores: {
          id: string;
          points: string;
          scoring_type_id: string;
        }[];
      } | null;
      team_id: string;
    }[];
    entry_slips: {
      id: string;
      boost_id: null;
      boost_payout: string;
      cancellation_expires_at: null;
      cashout_eligible: boolean;
      cashout_payout_option_id: null;
      cashout_projected_payout: null;
      champion_points: null;
      current_max_payout_multiplier: string;
      fee: string;
      free_entry: boolean;
      initial_max_payout_multiplier: string;
      insurance_fallbacks:
        | {
            current_max_payout_multiplier: string;
            initial_max_payout_multiplier: string;
            loss_count: number;
          }[]
        | null;
      insured: boolean;
      minimum_shift_configuration: {
        '2': '0.75';
        '3': '0.4';
        '4': '0.25';
        default: '0.0';
      };
      payout: string | null;
      payout_option_id: string;
      payout_shifts: string[];
      pickem_pool_entry?: {
        id: string;
        payout: string;
        pickem_pool_id: string;
        pool_entry_count: number;
      };
      pickem_pool_style_id: string | null;
      pickem_pool_style_option_id: string | null;
      power_up: {
        id: string;
        auto_applies: boolean;
        background_color: string;
        background_image: string;
        contentful_info_id: string;
        cta_text: null;
        cta_url: null;
        description: string;
        fee_amount: null;
        header_contentful_info_id: string;
        header_image: null;
        hero_image: string;
        icon: string;
        percentage: string;
        primary_color_dark_mode: string;
        primary_color_light_mode: string;
        secondary_color_dark_mode: string;
        secondary_color_light_mode: string;
        tag: null;
        title: string;
        type: string;
      };
      prize_max_payout: null;
      rebooted: boolean;
      scorchers_visible: boolean;
      selection_count: null;
      selections: {
        id: string;
        actual_stat_value: null;
        admin_graded: boolean;
        created_at: string;
        discounted_line_value: string | null;
        in_play: boolean;
        option_id: string;
        option_type: EntryOptionType;
        payout_multiplier: string;
        power_up: null;
        rebooted: boolean;
        result: SelectionResult;
        rival_actual_stat_value: null;
      }[];
      settled_payout_option_id: null;
      settled_pickem_pool_style_option_id: null;
      share_id: string;
      share_link: string;
      state: string;
      status: EntryStatus;
      type: EntryType;
    }[];
    games: {
      id: number;
      away_team_id: string;
      away_team_score: number;
      home_team_id: string;
      home_team_score: number;
      manually_created: boolean;
      match_progress: string;
      period: number;
      rescheduled_from: string | null;
      scheduled_at: string;
      season_type: SeasonType;
      sport_id: SportType;
      status: GameStatus;
      title: string;
      type: 'Game';
      year: number;
    }[];
    over_under_lines: {
      id: string;
      expires_at: string | null;
      line_type: LineType;
      live_event: boolean;
      live_event_stat: null;
      non_discounted_stat_value: null;
      over_under_id: string;
      rank: number;
      stat_value: string;
      status: string;
    }[];
    over_under_options: {
      id: string;
      choice: 'higher' | 'lower';
      choice_display: string;
      over_under_line_id: string;
      payout_multiplier: string;
      type: EntryOptionType.OverUnder;
    }[];
    over_unders: {
      id: string;
      appearance_stat: {
        id: string;
        appearance_id: string;
        display_stat: string;
        graded_by: GradedBy;
        pickem_stat_id: string;
        stat: string;
      };
      boost: {
        id: string;
        boost_type: string;
        color: string;
        coming_soon_enabled: boolean;
        contentful_info_id: string;
        description: string;
        display_title: string;
        expired_at: null;
        icon: string;
        payout_style_id: string;
        payout_type: string;
        text_color: string;
      } | null;
      scoring_type_id: null;
      title: string;
    }[];
    players: {
      id: string;
      country: null;
      first_name: string;
      image_url: string;
      last_name: string;
      position_id: string;
      sport_id: SportType;
      team_id: string;
    }[];
    rival_lines: [];
    rival_options: [];
    rivals: [];
    solo_games: [];
  };
  meta: {
    count: number;
    items: number;
    next: number | null;
    page: number;
  };
}

export function mergeUnderdogFantasySlipDtos<
  T extends
    | UnderdogFantasyGetSettledSlipsResponseDto
    | UnderdogFantasyGetActiveSlipsResponseDto
>(dtos: T[]): T {
  const appearances = dtos.flatMap((dto) => dto.data.appearances);
  const entrySlips = dtos.flatMap((dto) => dto.data.entry_slips);
  const games = dtos.flatMap((dto) => dto.data.games);
  const overUnderLines = dtos.flatMap((dto) => dto.data.over_under_lines);
  const overUnderOptions = dtos.flatMap((dto) => dto.data.over_under_options);
  const overUnders = dtos.flatMap((dto) => dto.data.over_unders);
  const players = dtos.flatMap((dto) => dto.data.players);

  return <T>{
    data: {
      appearances: appearances,
      entry_slips: entrySlips,
      games: games,
      over_under_lines: overUnderLines,
      over_under_options: overUnderOptions,
      over_unders: overUnders,
      players: players,
      rival_lines: [],
      rival_options: [],
      rivals: [],
      solo_games: [],
    },
    meta: {
      count: entrySlips.length,
      items: entrySlips.length,
      next: null,
      page: 1,
    },
  };
}
