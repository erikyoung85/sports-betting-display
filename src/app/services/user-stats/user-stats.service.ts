import { Injectable } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { EntryStatus } from '../underdog-fantasy/enums/entry-status.enum';
import { SelectionResult } from '../underdog-fantasy/enums/selection-result.enum';
import { UnderdogFantasyEntrySlip } from '../underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasyService } from '../underdog-fantasy/underdog-fantasy.service';
import { UserService } from '../user/user.service';
import { UserStats } from './models/user-stats.model';

@Injectable({
  providedIn: 'root',
})
export class UserStatsService {
  statsByUser$ = combineLatest([
    this.underdogFantasyService.activeSlipsByUsername$,
    this.underdogFantasyService.settledSlipsByUsername$,
    this.underdogFantasyService.slipToAdditionalUsers$,
    this.userService.userDict$,
  ]).pipe(
    map(
      ([
        activeSlipsByUsername,
        settledSlipsByUsername,
        slipToAdditionalUsers,
        userDict,
      ]) => {
        const statsByUser: { [username: string]: UserStats } = {};
        // init values for each user
        Object.keys(userDict).forEach(
          (username) =>
            (statsByUser[username] = {
              username: username,
              numBetsPlaced: 0,
              numBetsPending: 0,
              numBetsWon: 0,
              numBetsLost: 0,
              moneyBet: 0,
              moneyWon: 0,
              moneyLost: 0,
              moneyPending: 0,
              totalProfit: 0,
            })
        );

        // for each slip, add values to the user's stats
        Object.keys(userDict).forEach((username) => {
          const slips = [
            ...(settledSlipsByUsername[username] ?? []),
            ...(activeSlipsByUsername[username] ?? []),
          ];
          slips.forEach((slip) => {
            // if an additionalUsers entry doesnt exist then the group is just the original user
            const additionalUsernames = slipToAdditionalUsers[slip.id] ?? [
              username,
            ];
            const numUsersInGroup = additionalUsernames.length;

            const caluclatedValues = this.calculateStatsForSlip(
              slip,
              numUsersInGroup
            );

            additionalUsernames.forEach((username) => {
              statsByUser[username].numBetsPlaced++;
              if (caluclatedValues.betWon) {
                statsByUser[username].numBetsWon++;
              }
              if (caluclatedValues.betLost) {
                statsByUser[username].numBetsLost++;
              }
              if (caluclatedValues.betPending) {
                statsByUser[username].numBetsPending++;
              }
              statsByUser[username].moneyBet += caluclatedValues.moneyBet;
              statsByUser[username].moneyWon += caluclatedValues.moneyWon;
              statsByUser[username].moneyLost += caluclatedValues.moneyLost;
              statsByUser[username].moneyPending +=
                caluclatedValues.moneyPending;
              statsByUser[username].totalProfit += caluclatedValues.totalProfit;
            });
          });
        });
        return statsByUser;
      }
    )
  );

  statLeaders$ = this.statsByUser$.pipe(
    map((statsByUser) => {
      const leaderStatFunc = (userStats: UserStats) => userStats.totalProfit;

      const leaderStatValue = Math.max(
        ...Object.values(statsByUser).map(leaderStatFunc)
      );

      return Object.keys(statsByUser).filter(
        (username) => leaderStatFunc(statsByUser[username]) === leaderStatValue
      );
    })
  );

  /** Calculate values for a single slip. If there are multiple group members it will split all values evenly */
  private calculateStatsForSlip(
    slip: UnderdogFantasyEntrySlip,
    numUsersInGroup: number
  ): {
    betWon: boolean;
    betLost: boolean;
    betPending: boolean;
    moneyBet: number;
    moneyWon: number;
    moneyLost: number;
    moneyPending: number;
    totalProfit: number;
  } {
    const betPending = slip.status === EntryStatus.Active;
    const betSettled = slip.status === EntryStatus.Settled;
    const betWon = slip.result === SelectionResult.Won;
    const betLost = slip.result === SelectionResult.Lost;
    const moneyBet = slip.fee;
    let moneyWon = 0;
    let moneyLost = 0;
    let moneyPending = 0;
    let totalProfit = 0;
    if (betSettled) {
      moneyWon = betWon ? slip.resultPayout ?? 0 : 0;
      moneyLost = betLost ? slip.fee : 0;
      totalProfit = moneyWon - slip.fee;
    }

    if (betPending) {
      moneyPending = slip.fee;
    }

    return {
      betPending,
      betWon,
      betLost,
      moneyBet: moneyBet / numUsersInGroup,
      moneyWon: moneyWon / numUsersInGroup,
      moneyLost: moneyLost / numUsersInGroup,
      moneyPending: moneyPending / numUsersInGroup,
      totalProfit: totalProfit / numUsersInGroup,
    };
  }

  constructor(
    private readonly userService: UserService,
    private readonly underdogFantasyService: UnderdogFantasyService
  ) {}
}
