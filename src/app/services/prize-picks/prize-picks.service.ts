import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  distinctUntilChanged,
  lastValueFrom,
  map,
  Observable,
} from 'rxjs';
import { UnderdogFantasyAuthenticateResponseDto } from '../underdog-fantasy/dtos/underdog-fantasy-authenticate.response.dto';
import { UnderdogFantasyGetActiveSlipsResponseDto } from '../underdog-fantasy/dtos/underdog-fantasy-get-active-slips.response.dto';
import {
  mergeUnderdogFantasySlipDtos,
  UnderdogFantasyGetSettledSlipsResponseDto,
} from '../underdog-fantasy/dtos/underdog-fantasy-get-settled-slips.response.dto';
import { EntryStatus } from '../underdog-fantasy/enums/entry-status.enum';
import { UnderdogFantasyEntrySlip } from '../underdog-fantasy/models/underdog-fantasy-entry-slip.model';
import { User } from '../user/models/user.model';
import { UserService } from '../user/user.service';

type SlipToAdditionalUsernames = { [slipId: string]: string[] };

@Injectable({
  providedIn: 'root',
})
export class PrizePicksService {
  private readonly baseUrl = 'https://api.prizepicks.com';

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

  constructor(
    private readonly http: HttpClient,
    private readonly userService: UserService
  ) {}

  async test(): Promise<void> {
    debugger;
    const signInUrl = 'https://api.prizepicks.com/users/sign_in';
    const signInBody = {
      user: {
        email: 'young.erik9@gmail.com',
        password: 'Packbrew001!',
        remember_me: true,
      },
      token: '',
    };
    this.http
      .post(signInUrl, signInBody)
      .pipe(catchError((err) => err))
      .subscribe((response) => {
        console.log(response);
        debugger;
      });
  }

  async getAllSlipsForUsers(users: User[]): Promise<void> {
    const validUsers = users.filter(
      (user) => user.underdogUserInfo?.authError === false
    );
    if (validUsers.length === 0) return;

    Promise.all(
      validUsers.map(async (user) => {
        // get settled slips for user
        const settledSlips = await this.getSettledSlips(user);
        this._settledSlipsByUsername$.next({
          ...this._settledSlipsByUsername$.value,
          [user.username]: settledSlips,
        });

        // get active slips for user
        const activeSlips = await this.getActiveSlips(user);
        this._activeSlipsByUsername$.next({
          ...this._activeSlipsByUsername$.value,
          [user.username]: activeSlips,
        });
      })
    ).then(() => this._dataLastUpdated$.next(new Date()));
  }

  private async getSettledSlips(
    user: User
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
          `${this.baseUrl}/v1/entries?filter=settled&page=${nextPage}`,
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

      allDtos.push(settledSlipsDto);
      nextPage = settledSlipsDto.meta.next;
    }

    const mergedDto = mergeUnderdogFantasySlipDtos(allDtos);
    const settledSlips = UnderdogFantasyEntrySlip.fromDto(mergedDto).filter(
      (slip) => slip.status !== EntryStatus.Cancelled
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
        `${this.baseUrl}/?filter=pending`,
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
      this.http.post<{ success: boolean }>('/api/underdog/refreshToken', body)
    ).catch((err: HttpErrorResponse) => err);

    if (response instanceof HttpErrorResponse) {
      // if we get a 429, we've hit the rate limit
      if (response.status === 429) {
        this.userService.setUnderdogUserAuthErrorFlag(user.username, true);
      }

      return new Error(response.error);
    }

    const refreshedUser: User | undefined = await this.userService.getUser(
      user.username
    );
    if (refreshedUser === undefined) {
      return new Error('Error fetching user after token refresh');
    }
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