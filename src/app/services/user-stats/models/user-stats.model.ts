export interface UserStats {
  username: string;
  numBetsPlaced: number;
  numBetsPending: number;
  numBetsWon: number;
  numBetsLost: number;
  moneyBet: number;
  moneyWon: number;
  moneyLost: number;
  moneyPending: number;
  totalProfit: number;
  totalMultiplier: number;
}
