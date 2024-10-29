import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { keyBy } from 'lodash';
import { combineLatest } from 'rxjs';
import { SlipChangeComponent } from '../../components/slip-change/slip-change.component';
import { User } from '../user/models/user.model';
import { UserService } from '../user/user.service';
import { SelectionResult } from './enums/selection-result.enum';
import { UnderdogFantasyEntrySlip } from './models/underdog-fantasy-entry-slip.model';
import { UnderdogFantasySelection } from './models/underdog-fantasy-selection.model';
import { UnderdogFantasyService } from './underdog-fantasy.service';

const SHOW_FOR_DURATION = 5000;

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
  selectionId: string;
  newStatus: SelectionResult;
}

export type SlipChange = SlipResultChange | SelectionResultChange;

@Injectable({
  providedIn: 'root',
})
export class UnderdogChangeDetectionService {
  private currentSlipDictByUser: SlipDictByUser = {};

  private changesToBeDisplayed: SlipChange[] = [];

  private changeDetectionEnabled = false;
  private showingChanges = false;
  private mockChangeSent = false;

  constructor(
    private readonly underdogService: UnderdogFantasyService,
    private readonly userService: UserService,
    private readonly overlay: Overlay
  ) {}

  initChangeDetection(): void {
    if (this.changeDetectionEnabled) {
      console.log('change detection already enabled');
      return;
    }

    this.changeDetectionEnabled = true;
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

        // show mock change for dev
        // const mockUser = Object.values(userDict)[0];
        // const mockSlip = Object.values(
        //   newSlipDictByUser[mockUser?.username] ?? {}
        // )[0];
        // if (mockUser && mockSlip && !this.mockChangeSent) {
        //   this.mockChangeSent = true;

        //   const change1 = <SlipResultChange>{
        //     changeType: SlipChangeType.SLIP_RESULT,
        //     slip: mockSlip,
        //     user: mockUser,
        //     newStatus: SelectionResult.Lost,
        //   };
        //   const change2 = <SelectionResultChange>{
        //     changeType: SlipChangeType.SELECTION_RESULT,
        //     slip: mockSlip,
        //     selectionId: mockSlip.selections[0].id,
        //     user: mockUser,
        //     newStatus: SelectionResult.Lost,
        //   };

        //   this.changesToBeDisplayed.push(change1, change2);
        //   this.showChanges();
        // }

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
              this.changesToBeDisplayed.push(...changes);
              this.showChanges();
            }
          }
        }

        // save new state of slipDictByUser
        this.currentSlipDictByUser = newSlipDictByUser;
      }
    );
  }

  async showChanges(): Promise<void> {
    if (this.showingChanges) return;
    this.showingChanges = true;

    const timeout = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    let change = this.changesToBeDisplayed.shift();
    while (change !== undefined) {
      console.log('change detected: ', change);

      const overlayRef = this.overlay.create({
        hasBackdrop: true,
        positionStrategy: this.overlay
          .position()
          .global()
          .centerHorizontally()
          .centerVertically(),
      });
      const slipChangePortal = new ComponentPortal(SlipChangeComponent);
      const componentRef = overlayRef.attach(slipChangePortal);
      componentRef.instance.slipChange = change;

      // wait for duration and close overlay
      await timeout(SHOW_FOR_DURATION);
      overlayRef.detach();
      await timeout(1000);

      // update change to next change to display
      change = this.changesToBeDisplayed.shift();
    }

    this.showingChanges = false;
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

    // first detect selection result changes
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
          selectionId: newSelection.id,
          newStatus: newSelection.result,
        };
        changes.push(change);
      }
    });

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

    return changes;
  }
}
