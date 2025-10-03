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
  payoutPending: number;
  totalProfit: number;

  totalMultiplier: number;
  avgMultiplier: number;
  medianMultiplier: number;

  totalWagered: number;
  avgWager: number;
  medianWager: number;

  biggestWin: number;
  biggestLoss: number;
}
