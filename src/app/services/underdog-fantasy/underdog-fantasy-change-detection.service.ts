import { Injectable } from '@angular/core';
import { keyBy } from 'lodash';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { User } from '../user/models/user.model';
import { UserService } from '../user/user.service';
import { SelectionResult } from './enums/selection-result.enum';
import { UnderdogFantasyEntrySlip } from './models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasySelection } from './models/underdog-fantasy-selection.model';
import { UnderdogFantasyService } from './underdog-fantasy.service';

type SlipDictByUser = {
  [username: string]: { [slidId: string]: UnderdogFantasyEntrySlip };
};

export enum SlipChangeType {
  NEW_SLIP = 'new_slip',
  SLIP_RESULT = 'slip_status',
  SELECTION_RESULT = 'selection_result',
}

interface SlipChangeBase {
  changeType: SlipChangeType;
  slip: UnderdogFantasyEntrySlip;
  user: User;
}

export interface SlipResultChange extends SlipChangeBase {
  changeType: SlipChangeType.SLIP_RESULT;
  newStatus: SelectionResult;
}

export interface SelectionResultChange extends SlipChangeBase {
  changeType: SlipChangeType.SELECTION_RESULT;
  legId: string;
  newStatus: SelectionResult;
}

type SlipChange = SlipResultChange | SelectionResultChange;

@Injectable({
  providedIn: 'root',
})
export class UnderdogChangeDetectionService {
  private currentSlipDictByUser: SlipDictByUser = {};

  readonly changesToBeDisplayed$ = new BehaviorSubject<SlipChange[]>([]);

  constructor(
    private readonly underdogService: UnderdogFantasyService,
    private readonly userService: UserService
  ) {
    combineLatest([
      this.underdogService.activeSlipsByUsername$,
      this.underdogService.settledSlipsByUsername$,
      this.userService.userDict$,
    ]).subscribe(
      ([activeSlipsByUsername, settledSlipsByUsername, userDict]) => {
        // create new slipDictByUser
        const newSlipDictByUser: SlipDictByUser = {};
        for (const username of Object.keys(userDict)) {
          const slipDict = keyBy(
            [
              ...(activeSlipsByUsername[username] ?? []),
              ...(settledSlipsByUsername[username] ?? []),
            ],
            (slip) => slip.id
          );
          newSlipDictByUser[username] = slipDict;
        }

        // detect changes made to any slips
        for (const username of Object.keys(newSlipDictByUser)) {
          const user = userDict[username];
          const prevSlipDict = this.currentSlipDictByUser[username] ?? {};
          const newSlipDict = newSlipDictByUser[username];

          for (const slipId of Object.keys(newSlipDict)) {
            const prevSlip = prevSlipDict[slipId];
            const newSlip = newSlipDict[slipId];

            if (
              user !== undefined &&
              prevSlip !== undefined &&
              newSlip !== undefined
            ) {
              const changes = this.detectChanges(prevSlip, newSlip, user);
              changes.forEach((change) => {
                this.showChange(change);
              });
            }
          }
        }

        // save new state of slipDictByUser
        this.currentSlipDictByUser = newSlipDictByUser;
      }
    );
  }

  async showChange(change: SlipChange): Promise<void> {
    console.log('change detected: ', change);
  }

  private detectChanges(
    prevSlip: UnderdogFantasyEntrySlip,
    newSlip: UnderdogFantasyEntrySlip,
    user: User
  ): SlipChange[] {
    if (prevSlip.id !== newSlip.id) {
      console.log('trying to compare slips with different ids');
      return [];
    }

    const changes: SlipChange[] = [];

    // detect slip result change
    if (prevSlip.result !== newSlip.result) {
      const change: SlipResultChange = {
        changeType: SlipChangeType.SLIP_RESULT,
        slip: newSlip,
        user: user,
        newStatus: newSlip.result,
      };
      changes.push(change);
    }

    const oldSelectionDict: {
      [selectionId: string]: UnderdogFantasySelection;
    } = keyBy(prevSlip.selections, (selection) => selection.id);
    newSlip.selections.forEach((newSelection) => {
      const oldSelection = oldSelectionDict[newSelection.id];
      if (oldSelection === undefined) return;

      if (oldSelection.result !== newSelection.result) {
        const change: SelectionResultChange = {
          slip: newSlip,
          user: user,
          changeType: SlipChangeType.SELECTION_RESULT,
          legId: newSelection.id,
          newStatus: newSelection.result,
        };
        changes.push(change);
      }
    });

    return changes;
  }
}
