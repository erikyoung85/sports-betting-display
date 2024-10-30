enum PrizePicksGameMode {
  PICKEM = 'pickem',
}
enum PrizePicksResult {
  LOST = 'lost',
  PARTIAL_WIN = 'partial_win',
  WON = 'won',
}
enum PrizePicksSport {
  NFL = 'NFL',
  MLB = 'MLB',
  NBA = 'NBA',
}
enum PrizePicksOddsType {
  DEMON = 'demon',
  GOBLIN = 'goblin',
}
enum PrizePicksStatus {
  finished = 'finished',
}
enum PrizePicksWagerType {
  OVER = 'over',
  UNDER = 'under',
}
enum PrizePicksPromotionType {
  PROTECTED_PLAY = 'ProtectedPlay',
}

enum PrizePicksIncludedType {
  NEW_PLAYER = 'new_player',
  PROJECTION = 'projection',
  TEAM = 'team',
  STAT_AVERAGE = 'stat_average',
  SCORE = 'score',
  PREDICTION = 'prediction',
  STAT_TYPE = 'stat_type',
  LEAGUE = 'league',
  PROMOTION = 'promotion',
  PROJECTION_TYPE = 'projection_type',
  DURATION = 'duration',
}

export type PrizePicksRelationshipDto = {
  [T in PrizePicksIncludedType]: {
    data: {
      type: T;
      id: string;
    } | null;
  };
};

export type PrizePicksIncludedDto =
  | PrizePicksIncludedNewPlayerDto
  | PrizePicksIncludedProjectionDto
  | PrizePicksIncludedTeamDto
  | PrizePicksIncludedStatAverageDto
  | PrizePicksIncludedScoreDto
  | PrizePicksIncludedPredictionDto
  | PrizePicksIncludedStatTypeDto
  | PrizePicksIncludedLeagueDto
  | PrizePicksIncludedPromotionDto
  | PrizePicksIncludedProjectionTypeDto
  | PrizePicksIncludedDurationDto;

export interface PrizePicksEntryResponseDto {
  data: PrizePicksNewWagerDto[];
  included: PrizePicksIncludedDto[];
  links: {
    self: string;
  };
  meta: {
    current_page: number;
    potential_winnings_cents: number;
    total_pages: number;
  };
}

export interface PrizePicksNewWagerDto {
  type: 'new_wager';
  id: string;
  attributes: {
    amount_bet_cents: number;
    amount_to_win_cents: number;
    amount_won_cents: number;
    code: null;
    community_play_id: null;
    correlated_entry: boolean;
    created_at: string;
    eligible_for_refund: boolean;
    f2p: boolean;
    game_mode: PrizePicksGameMode;
    is_gift: boolean;
    parlay_count: number;
    payout_data: {
      srp: number[][];
      original_payout_multipliers: null;
    };
    payout_multipliers: {
      [number: string]: number;
    };
    payouts: {
      [number: string]: {
        amount: number;
        multiplier: number;
      };
    };
    pick_protection: boolean;
    promo_tag: boolean;
    promotion_id: null;
    refund_allowed_until: null;
    result: PrizePicksResult;
    reverted_payouts: {
      [number: string]: {
        amount: number;
        multiplier: number;
      };
    };
    ruleset_id: number;
    sport: PrizePicksSport;
    updated_at: string;
    user_id: number;
    uuid: null;
  };
  relationships: PrizePicksRelationshipDto;
}

export interface PrizePicksIncludedNewPlayerDto {
  type: 'new_player';
  id: '67698';
  attributes: {
    combo: boolean;
    display_name: string;
    image_url: string;
    league: PrizePicksSport;
    league_id: number;
    market: string;
    name: string;
    position: string;
    team: string;
    team_name: string;
  };
  relationships: PrizePicksRelationshipDto;
}

export interface PrizePicksIncludedProjectionDto {
  type: PrizePicksIncludedType.PROJECTION;
  id: string;
  attributes: {
    adjusted_odds: boolean;
    board_time: string;
    custom_image: string | null;
    description: string;
    end_time: string | null;
    flash_sale_line_score: null;
    game_id: string;
    hr_20: boolean;
    in_game: boolean;
    is_live: boolean;
    is_promo: boolean;
    line_score: number;
    odds_type: PrizePicksOddsType;
    projection_type: string;
    rank: number;
    refundable: false;
    start_time: string;
    stat_display_name: string;
    stat_type: string;
    status: PrizePicksStatus;
    tv_channel: null;
    updated_at: string;
  };
  relationships: PrizePicksRelationshipDto;
}

export interface PrizePicksIncludedTeamDto {
  type: PrizePicksIncludedType.TEAM;
  id: string;
  attributes: {
    abbreviation: string;
    market: string;
    name: string;
    primary_color: string;
    secondary_color: string;
    tertiary_color: string;
  };
}

export interface PrizePicksIncludedStatAverageDto {
  type: PrizePicksIncludedType.STAT_AVERAGE;
  id: string;
  attributes: {
    average: number;
    count: number;
  };
}

export interface PrizePicksIncludedScoreDto {
  type: PrizePicksIncludedType.SCORE;
  id: string;
  attributes: {
    details: { [statKey: string]: number } | null;
    is_final: boolean;
    is_off_the_board: boolean;
    score: number;
    unders_win_dnp: boolean;
  };
}

export interface PrizePicksIncludedPredictionDto {
  type: PrizePicksIncludedType.PREDICTION;
  id: string;
  attributes: {
    initial_score: number;
    is_promo: boolean;
    line_score: number;
    odds_type: PrizePicksOddsType;
    wager_type: PrizePicksWagerType;
  };
  relationships: PrizePicksRelationshipDto;
}

export interface PrizePicksIncludedStatTypeDto {
  type: PrizePicksIncludedType.STAT_TYPE;
  id: string;
  attributes: {
    lfg_ignored_leagues: [];
    name: string;
    rank: number;
  };
}

export interface PrizePicksIncludedLeagueDto {
  type: PrizePicksIncludedType.LEAGUE;
  id: string;
  attributes: {
    active: boolean;
    f2p_enabled: boolean;
    icon: string;
    image_url: string;
    last_five_games_enabled: boolean;
    league_icon_id: number;
    name: string;
    projections_count: number;
    rank: number;
    show_trending: boolean;
  };
  relationships: {
    projection_filters: {
      data: [];
    };
  };
}

export interface PrizePicksIncludedPromotionDto {
  type: PrizePicksIncludedType.PROMOTION;
  id: string;
  attributes: {
    entry_amount_cents: number | null;
    entry_slip_description: string;
    headline: string;
    long_description: string;
    name: string;
    opt_in_by: string;
    payout_cents: number | null;
    payout_multipliers: number | null;
    short_description: string;
    type: PrizePicksPromotionType;
    use_by: string;
  };
}

export interface PrizePicksIncludedProjectionTypeDto {
  type: PrizePicksIncludedType.PROJECTION_TYPE;
  id: string;
  attributes: {
    name: string;
  };
}

export interface PrizePicksIncludedDurationDto {
  type: PrizePicksIncludedType.DURATION;
  id: string;
  attributes: {
    name: string;
  };
}
