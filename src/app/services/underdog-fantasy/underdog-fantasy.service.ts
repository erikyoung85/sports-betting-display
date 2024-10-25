import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  lastValueFrom,
  map,
  Observable,
} from 'rxjs';
import { User } from '../user/models/user.model';
import { UserService } from '../user/user.service';
import { UnderdogFantasyAuthenticateResponseDto } from './dtos/underdog-fantasy-authenticate.response.dto';
import { UnderdogFantasyGetActiveSlipsResponseDto } from './dtos/underdog-fantasy-get-active-slips.response.dto';
import {
  mergeUnderdogFantasySlipDtos,
  UnderdogFantasyGetSettledSlipsResponseDto,
} from './dtos/underdog-fantasy-get-settled-slips.response.dto';
import { EntryStatus } from './enums/entry-status.enum';
import { UnderdogFantasyEntrySlip } from './models/underdog-fantasy-entry-slip.model';

type SlipToAdditionalUsernames = { [slipId: string]: string[] };

@Injectable({
  providedIn: 'root',
})
export class UnderdogFantasyService {
  private readonly baseUrl = 'https://api.underdogfantasy.com';

  private _activeSlipsByUsername$: BehaviorSubject<{
    [username: string]: UnderdogFantasyEntrySlip[] | undefined;
  }> = new BehaviorSubject({});
  activeSlipsByUsername$ = this._activeSlipsByUsername$.asObservable();

  private _settledSlipsByUsername$: BehaviorSubject<{
    [username: string]: UnderdogFantasyEntrySlip[] | undefined;
  }> = new BehaviorSubject({});
  settledSlipsByUsername$ = this._settledSlipsByUsername$.asObservable();

  private _slipToAdditionalUsers$: BehaviorSubject<SlipToAdditionalUsernames> =
    new BehaviorSubject({});
  slipToAdditionalUsers$ = this._slipToAdditionalUsers$.asObservable();

  slipToOriginalUser$: Observable<{
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

  slipToUsers$: Observable<{
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

  constructor(
    private readonly http: HttpClient,
    private readonly userService: UserService
  ) {
    this.userService.userDict$.subscribe((userDict) => {
      Object.values(userDict).forEach(async (user) => {
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
      });
    });

    // get group slips data
    this.getSlipToAdditionalUsers();
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

  private async getUnderdogToken(user: User): Promise<string | undefined> {
    // if we have no login info for underdog theres nothing we can do
    if (user.underdogUserInfo === undefined) {
      return;
    }

    // if we have no token data, try to auth with password
    if (user.underdogUserInfo.token === undefined) {
      return undefined;
    }

    // if we have token data, check if its expired
    const tokenIsExpired =
      new Date(user.underdogUserInfo.token.tokenExpirationDate) < new Date();
    if (tokenIsExpired) {
      console.info(`Token is expired for ${user.username}... refreshing`);

      const token = await this.refreshTokenForUser(user);
      if (token instanceof Error) {
        console.error(`Error refreshing token for ${user.username}`, token);
        return undefined;
      }

      console.info(`Successfully refreshed token for ${user.username}`);
      return token.access_token;
    }

    return user.underdogUserInfo.token.accessToken;
  }

  private async refreshTokenForUser(
    user: User
  ): Promise<UnderdogFantasyAuthenticateResponseDto | Error> {
    if (user.underdogUserInfo?.token?.refreshToken === undefined) {
      return new Error('No refresh token found');
    }

    const body = {
      refresh_token: user.underdogUserInfo.token.refreshToken,
    };

    const tokenResponse = await lastValueFrom(
      this.http.post<UnderdogFantasyAuthenticateResponseDto>(
        '/api/underdog/refreshToken',
        body
      )
    ).catch((err: HttpErrorResponse) => err);

    if (tokenResponse instanceof HttpErrorResponse) {
      return new Error(tokenResponse.message);
    }

    user.underdogUserInfo.token = {
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpirationDate: new Date(
        new Date().getTime() + tokenResponse.expires_in * 1000
      ).toISOString(),
    };
    this.userService.setUser(user);

    return tokenResponse;
  }

  async authWithPassword(
    username: string,
    password: string
  ): Promise<UnderdogFantasyAuthenticateResponseDto | Error> {
    const body = {
      username: username,
      password: password,
    };

    const tokenResponse = await lastValueFrom(
      this.http.post<
        | UnderdogFantasyAuthenticateResponseDto
        | { error: string; error_description: string }
      >('/api/underdog/auth', body)
    ).catch((err: HttpErrorResponse) => err);

    if (tokenResponse instanceof HttpErrorResponse) {
      return new Error(tokenResponse.message);
    }
    if ('error' in tokenResponse) {
      return new Error(
        tokenResponse.error + ' | ' + tokenResponse.error_description
      );
    }

    return tokenResponse;
  }
}
