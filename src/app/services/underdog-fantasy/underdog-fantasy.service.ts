import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isAfter, min } from 'date-fns';
import { groupBy, isEqual, keyBy } from 'lodash';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  interval,
  lastValueFrom,
  map,
  Observable,
  withLatestFrom,
} from 'rxjs';
import { GetUserResponseDto } from '../user/dtos/get-user.response.dto';
import { createUserFromDto, User } from '../user/models/user.model';
import { UserService } from '../user/user.service';
import { UnderdogFantasyAuthenticateResponseDto } from './dtos/underdog-fantasy-authenticate.response.dto';
import { UnderdogFantasyGetActiveSlipsResponseDto } from './dtos/underdog-fantasy-get-active-slips.response.dto';
import {
  mergeUnderdogFantasySlipDtos,
  UnderdogFantasyGetSettledSlipsResponseDto,
} from './dtos/underdog-fantasy-get-settled-slips.response.dto';
import { UnderdogFantasyGetShareLinkResponseDto } from './dtos/underdog-fantasy-get-share-link.response.dto';
import { EntryStatus } from './enums/entry-status.enum';
import { TailedBetInfo } from './models/tailed-bet-info.model';
import { UnderdogFantasyEntrySlip } from './models/underdog-fantasy-entry-slip.model';

type SlipToAdditionalUsernames = { [slipId: string]: string[] };

const DATE_CUTOFF = '2025-09-01T00:00:00Z';

@Injectable({
  providedIn: 'root',
})
export class UnderdogFantasyService {
  private readonly baseUrl = 'https://api.underdogfantasy.com';

  readonly _dataLastUpdated$: BehaviorSubject<Date> = new BehaviorSubject(
    new Date()
  );
  readonly dataLastUpdated$ = this._dataLastUpdated$.asObservable();

  private readonly _activeSlipsByUsername$: BehaviorSubject<{
    [username: string]: UnderdogFantasyEntrySlip[] | undefined;
  }> = new BehaviorSubject({});
  readonly activeSlipsByUsername$ = this._activeSlipsByUsername$.asObservable();

  private readonly _settledSlipsByUsername$: BehaviorSubject<{
    [username: string]: UnderdogFantasyEntrySlip[] | undefined;
  }> = new BehaviorSubject({});
  readonly settledSlipsByUsername$ =
    this._settledSlipsByUsername$.asObservable();

  private readonly _slipToAdditionalUsers$: BehaviorSubject<SlipToAdditionalUsernames> =
    new BehaviorSubject({});
  readonly slipToAdditionalUsers$ = this._slipToAdditionalUsers$.asObservable();

  readonly slipToOriginalUser$: Observable<{
    [slipId: string]: User;
  }> = combineLatest([
    this.userService.users$,
    this.activeSlipsByUsername$,
    this.settledSlipsByUsername$,
  ]).pipe(
    map(([users, activeSlipsByUsername, settledSlipsByUsername]) => {
      const slipToOriginalUser: { [slipId: string]: User } = {};

      users.forEach((user) => {
        const slips = [
          ...(activeSlipsByUsername[user.username] ?? []),
          ...(settledSlipsByUsername[user.username] ?? []),
        ];
        slips.forEach((slip) => {
          slipToOriginalUser[slip.id] = user;
        });
      });

      return slipToOriginalUser;
    })
  );

  readonly slipToUsers$: Observable<{
    [slipId: string]: User[];
  }> = combineLatest([
    this.userService.userDict$,
    this.activeSlipsByUsername$,
    this.settledSlipsByUsername$,
    this.slipToAdditionalUsers$,
  ]).pipe(
    map(
      ([
        userDict,
        activeSlipsByUsername,
        settledSlipsByUsername,
        slipToAdditionalUsers,
      ]) => {
        const slipToUsers: { [slipId: string]: User[] } = {};

        Object.values(userDict).forEach((user) => {
          const slips = [
            ...(activeSlipsByUsername[user.username] ?? []),
            ...(settledSlipsByUsername[user.username] ?? []),
          ];
          slips.forEach((slip) => {
            if (slipToUsers[slip.id] === undefined) {
              slipToUsers[slip.id] = [];
            }

            const usernamesForSlip = Array.from(
              new Set([
                user.username,
                ...(slipToAdditionalUsers[slip.id] ?? []),
              ])
            );
            const usersForSlip = usernamesForSlip.map(
              (username) => userDict[username]
            );

            slipToUsers[slip.id].push(...usersForSlip);
          });
        });

        return slipToUsers;
      }
    )
  );

  readonly underdogUsers$ = this.userService.users$.pipe(
    map((users) =>
      users
        .map((user) => user.underdogUserInfo)
        .filter((info) => info !== undefined)
    ),
    distinctUntilChanged((prev, curr) => isEqual(prev, curr))
  );

  readonly tailedBetsDict$ = combineLatest([
    this.activeSlipsByUsername$,
    this.settledSlipsByUsername$,
    this.slipToOriginalUser$,
  ]).pipe(
    map(([activeSlipsByUsername, settledSlipsByUsername, slipToUser]) => {
      const allSlips = [
        ...Object.values(activeSlipsByUsername).flatMap(
          (slipOrEmpty) => slipOrEmpty ?? []
        ),
        ...Object.values(settledSlipsByUsername).flatMap(
          (slipOrEmpty) => slipOrEmpty ?? []
        ),
      ];

      const groupedBetsDict = groupBy(allSlips, (slip) =>
        slip.selections.map((selection) => selection.optionId)
      );
      const groupedBets = Object.values(groupedBetsDict).filter(
        (group) => group.length > 1
      );

      const tailedBetsDict: {
        [slipId: string]: TailedBetInfo;
      } = {};
      groupedBets.forEach((group) => {
        const sortedGroup = group.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        );
        const originalSlip = sortedGroup[0];
        const originalUser = slipToUser[originalSlip.id];
        const tailedUsers = sortedGroup
          .slice(1)
          .map((slip) => slipToUser[slip.id])
          .filter((user) => user !== undefined);

        if (originalUser === undefined || tailedUsers.length === 0) return;

        tailedBetsDict[originalSlip.id] = {
          slipId: originalSlip.id,
          originalUsername: originalUser.username,
          tailedByUsernames: tailedUsers.map((user) => user.username),
        };
      });

      return tailedBetsDict;
    })
  );

  constructor(
    private readonly http: HttpClient,
    private readonly userService: UserService
  ) {
    // fire every 30 seconds or when the user dict changes
    interval(30000)
      .pipe(withLatestFrom(this.userService.users$))
      .subscribe(([_, users]) => {
        this.getAllSlipsForUsers(users, false);
      });

    // if the user list changes, get all slips for all users
    this.userService.userDict$
      .pipe(
        filter((userDict) => Object.keys(userDict).length > 0),
        distinctUntilChanged((prev, curr) =>
          isEqual(Object.keys(prev), Object.keys(curr))
        )
      )
      .subscribe((userDict) => {
        this.getAllSlipsForUsers(Object.values(userDict), true);
      });

    // get group slips data
    this.getSlipToAdditionalUsers();
  }

  async getAllSlipsForUsers(
    users: User[],
    refreshAllSettled: boolean
  ): Promise<void> {
    const validUsers = users.filter(
      (user) => user.underdogUserInfo?.authError === false && user.enabled
    );
    if (validUsers.length === 0) return;

    const settledSlipsByUsername: {
      [username: string]: UnderdogFantasyEntrySlip[] | undefined;
    } = {};
    const activeSlipsByUsername: {
      [username: string]: UnderdogFantasyEntrySlip[] | undefined;
    } = {};

    await Promise.all(
      validUsers.map(async (user) => {
        // get settled slips for user
        const allSettledSlips: UnderdogFantasyEntrySlip[] =
          (await this.getSettledSlips(user, refreshAllSettled)) ?? [];

        // get active slips for user
        const allActiveSlips = await this.getActiveSlips(user);
        // Find active slips that are actually settled now and remove them from activeSlips
        const settledActiveSlips = (allActiveSlips ?? []).filter(
          (activeSlip) => activeSlip.status === EntryStatus.Settled
        );
        const activeSlips =
          allActiveSlips !== undefined
            ? allActiveSlips.filter(
                (activeSlip) => activeSlip.status === EntryStatus.Active
              )
            : [];

        // merge settled slips with existing settled slips, removing duplicates
        let settledSlips: UnderdogFantasyEntrySlip[] = Object.values(
          keyBy([...allSettledSlips, ...settledActiveSlips], (slip) => slip.id)
        );

        // override existing settled slips if necessary
        if (!refreshAllSettled) {
          const existingSettledSlips =
            this._settledSlipsByUsername$.value[user.username] ?? [];
          settledSlips = Object.values(
            keyBy(
              [...existingSettledSlips, ...allSettledSlips],
              (slip) => slip.id
            )
          );
        }

        activeSlipsByUsername[user.username] = [...activeSlips];
        settledSlipsByUsername[user.username] = [...settledSlips];
      })
    );

    this._activeSlipsByUsername$.next(activeSlipsByUsername);
    this._settledSlipsByUsername$.next(settledSlipsByUsername);
    this._dataLastUpdated$.next(new Date());
  }

  private async getSettledSlips(
    user: User,
    allPages: boolean = true
  ): Promise<UnderdogFantasyEntrySlip[] | undefined> {
    const token = await this.getUnderdogToken(user);
    if (token === undefined) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const allDtos: UnderdogFantasyGetSettledSlipsResponseDto[] = [];
    let nextPage: number | null = 1;

    while (nextPage !== null) {
      const settledSlipsDto:
        | UnderdogFantasyGetSettledSlipsResponseDto
        | HttpErrorResponse = await lastValueFrom(
        this.http.get<UnderdogFantasyGetSettledSlipsResponseDto>(
          `${this.baseUrl}/v6/user/settled_entry_slips?page=${nextPage}`,
          {
            headers,
          }
        )
      ).catch((err: HttpErrorResponse) => err);

      if (settledSlipsDto instanceof HttpErrorResponse) {
        console.error(
          `Error getting settled slips for ${user.username}`,
          settledSlipsDto
        );
        return;
      }

      const minSlipTimestamp: Date = min(
        settledSlipsDto.data.entry_slips.map((slip) => slip.created_at)
      );

      allDtos.push(settledSlipsDto);

      nextPage =
        allPages && isAfter(minSlipTimestamp, DATE_CUTOFF)
          ? settledSlipsDto.meta.next
          : null;
    }

    const mergedDto = mergeUnderdogFantasySlipDtos(allDtos);
    const settledSlips = UnderdogFantasyEntrySlip.fromDto(mergedDto).filter(
      (slip) =>
        slip.status !== EntryStatus.Cancelled &&
        isAfter(slip.createdAt, DATE_CUTOFF)
    );
    return settledSlips;
  }

  private async getActiveSlips(
    user: User
  ): Promise<UnderdogFantasyEntrySlip[] | undefined> {
    const token = await this.getUnderdogToken(user);
    if (token === undefined) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const activeSlipsDto = await lastValueFrom(
      this.http.get<UnderdogFantasyGetActiveSlipsResponseDto>(
        `${this.baseUrl}/v5/user/active_entry_slips`,
        {
          headers,
        }
      )
    ).catch((err: HttpErrorResponse) => err);

    if (activeSlipsDto instanceof HttpErrorResponse) {
      console.error(
        `Error getting active slips for ${user.username}`,
        activeSlipsDto
      );
      return;
    }

    const activeSlips = UnderdogFantasyEntrySlip.fromDto(activeSlipsDto).filter(
      (slip) => slip.status !== EntryStatus.Cancelled
    );
    this._activeSlipsByUsername$.next({
      ...this._activeSlipsByUsername$.value,
      [user.username]: activeSlips,
    });

    return activeSlips;
  }

  private async getSlipToAdditionalUsers(): Promise<void> {
    const slipIdToUsernames = await lastValueFrom(
      this.http.get<SlipToAdditionalUsernames>(
        `api/underdog/getUsernamesBySlip`
      )
    ).catch((err: HttpErrorResponse) => err);
    if (slipIdToUsernames instanceof HttpErrorResponse) {
      console.error(
        `Error getting additional users for slips`,
        slipIdToUsernames
      );
      return;
    }

    this._slipToAdditionalUsers$.next(slipIdToUsernames);
  }

  async addUserToSlip(slipId: string, username: string): Promise<void> {
    const slipIdToUsernames = await lastValueFrom(
      this.http.post<SlipToAdditionalUsernames>(`api/underdog/addUserToSlip`, {
        slip_id: slipId,
        username: username,
      })
    ).catch((err: HttpErrorResponse) => err);
    if (slipIdToUsernames instanceof HttpErrorResponse) {
      console.error(`Error adding additional user to slip`, slipIdToUsernames);
      return;
    }

    // save new value
    this._slipToAdditionalUsers$.next(slipIdToUsernames);
  }

  async removeUserFromSlip(slipId: string, username: string): Promise<void> {
    const slipIdToUsernames = await lastValueFrom(
      this.http.post<SlipToAdditionalUsernames>(
        `api/underdog/removeUserFromSlip`,
        {
          slip_id: slipId,
          username: username,
        }
      )
    ).catch((err: HttpErrorResponse) => err);
    if (slipIdToUsernames instanceof HttpErrorResponse) {
      console.error(
        `Error removing additional user from slip`,
        slipIdToUsernames
      );
      return;
    }

    // save new value
    this._slipToAdditionalUsers$.next(slipIdToUsernames);
  }

  async getShareLink(
    user: User,
    entrySlipId: string
  ): Promise<UnderdogFantasyGetShareLinkResponseDto | Error> {
    const token = await this.getUnderdogToken(user);
    if (token === undefined) new Error('No auth token found');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const response = await lastValueFrom(
      this.http.post<UnderdogFantasyGetShareLinkResponseDto>(
        `${this.baseUrl}/v1/entry_slips/${entrySlipId}/share_link`,
        {},
        {
          headers: headers,
        }
      )
    ).catch((err: HttpErrorResponse) => err);

    if (response instanceof HttpErrorResponse) {
      return new Error(response.error);
    }

    return response;
  }

  private async getUnderdogToken(
    user: User,
    forceRefresh: boolean = false
  ): Promise<string | undefined> {
    // if we have no login info for underdog theres nothing we can do
    if (user.underdogUserInfo === undefined) {
      return;
    }

    // if we have no token data, try to auth with password
    if (user.underdogUserInfo.token === undefined) {
      return undefined;
    }

    // if we have token data, check if its expired
    const tokenExpirationDate = new Date(
      user.underdogUserInfo.token.tokenExpirationDate
    );
    const currentDate = new Date();
    const tokenIsExpired = tokenExpirationDate < currentDate;
    if (forceRefresh || tokenIsExpired) {
      if (tokenIsExpired)
        console.info(`Token is expired for ${user.username}... refreshing`);

      const userOrError = await this.refreshTokenForUser(user);
      if (userOrError instanceof Error) {
        console.error(userOrError);
        return undefined;
      }

      return userOrError.underdogUserInfo?.token?.accessToken;
    }

    return user.underdogUserInfo.token.accessToken;
  }

  private async refreshTokenForUser(user: User): Promise<User | Error> {
    if (user.underdogUserInfo?.authError === true) {
      return new Error(
        `Too many auth errors, skipping refresh for ${user.username}`
      );
    }

    if (user.underdogUserInfo?.token?.refreshToken === undefined) {
      return new Error('No refresh token found');
    }

    const body = {
      username: user.username,
    };

    const response = await lastValueFrom(
      this.http.post<GetUserResponseDto>('/api/underdog/refreshToken', body)
    ).catch((err: HttpErrorResponse) => err);

    if (response instanceof HttpErrorResponse) {
      // if we get a 429, we've hit the rate limit
      if (response.status === 429) {
        this.userService.setUnderdogUserAuthErrorFlag(user.username, true);
      }

      return new Error(response.error);
    }

    const refreshedUser = createUserFromDto(response);
    this.userService.setUser(refreshedUser);

    console.info('successfully refreshed token for', refreshedUser.username);

    return refreshedUser;
  }

  async authWithPassword(
    username: string,
    underdog_username: string,
    underdog_password: string
  ): Promise<UnderdogFantasyAuthenticateResponseDto | Error> {
    const body = {
      username: username,
      underdog_username: underdog_username,
      underdog_password: underdog_password,
    };

    const response = await lastValueFrom(
      this.http.post<UnderdogFantasyAuthenticateResponseDto>(
        '/api/underdog/auth',
        body
      )
    ).catch((err: HttpErrorResponse) => err);

    if (response instanceof HttpErrorResponse) {
      return new Error(response.error);
    }

    console.info('successfully logged into Underdog account for', username);

    return response;
  }
}
