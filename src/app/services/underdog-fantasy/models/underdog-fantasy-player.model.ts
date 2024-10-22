import { SportType } from '../enums/sport-type.enum';

export interface UnderdogFantasyPlayer {
  id: string;
  country: null;
  firstName: string;
  lastName: string;
  imageUrl: string;
  positionId: string;
  sportId: SportType;
  teamId: string;
}
