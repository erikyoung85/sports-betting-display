import { SportType } from '../enums/sport-type.enum';

export interface UnderdogFantasyGame {
  id: number;
  title: string;
  abbreviatedTitle: string;
  shortTitle: string;
  sportId: SportType;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamScore: number;
  awayTeamScore: number;
  matchProgress: string;
  type: 'Game';
}
