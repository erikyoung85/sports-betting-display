import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  lastValueFrom,
  map,
  Observable,
  take,
} from 'rxjs';
import { User } from '../user/models/user.model';
import { UserService } from '../user/user.service';
import { UnderdogFantasyAuthenticateResponseDto } from './dtos/underdog-fantasy-authenticate.response.dto';
import { UnderdogFantasyGetActiveSlipsResponseDto } from './dtos/underdog-fantasy-get-active-slips.response.dto';
import { UnderdogFantasyGetSettledSlipsResponseDto } from './dtos/underdog-fantasy-get-settled-slips.response.dto';
import { UnderdogFantasyEntrySlip } from './models/underdog-fantasy-entry-slip.model';

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

  slipToUsers$: Observable<{
    [slipId: string]: User[];
  }> = combineLatest([
    this.userService.users$,
    this.activeSlipsByUsername$,
    this.settledSlipsByUsername$,
  ]).pipe(
    map(([users, activeSlipsByUsername, settledSlipsByUsername]) => {
      const slipToUsers: { [slipId: string]: User[] } = {};

      users.forEach((user) => {
        const slips = [
          ...(activeSlipsByUsername[user.username] ?? []),
          ...(settledSlipsByUsername[user.username] ?? []),
        ];
        slips.forEach((slip) => {
          if (slipToUsers[slip.id] === undefined) {
            slipToUsers[slip.id] = [];
          }

          slipToUsers[slip.id].push(user);
        });
      });

      return slipToUsers;
    })
  );

  constructor(
    private readonly http: HttpClient,
    private readonly userService: UserService
  ) {}

  getSettledSlips(): void {
    this.userService.userDict$.pipe(take(1)).subscribe(async (userDict) => {
      await Promise.all(
        Object.values(userDict).map(async (user) => {
          const token = await this.getUnderdogToken(user);
          if (token === undefined) return;

          const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
          });

          const settledSlipsDto = await lastValueFrom(
            this.http.get<UnderdogFantasyGetSettledSlipsResponseDto>(
              `${this.baseUrl}/v6/user/settled_entry_slips`,
              {
                headers,
              }
            )
          );

          const settledSlips =
            UnderdogFantasyEntrySlip.fromDto(settledSlipsDto);
          this._settledSlipsByUsername$.next({
            ...this._settledSlipsByUsername$.value,
            [user.username]: settledSlips,
          });
        })
      );
    });
  }

  getActiveSlips(): void {
    this.userService.userDict$.pipe(take(1)).subscribe(async (userDict) => {
      await Promise.all(
        Object.values(userDict).map(async (user) => {
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
          );

          const activeSlips = UnderdogFantasyEntrySlip.fromDto(activeSlipsDto);
          this._activeSlipsByUsername$.next({
            ...this._activeSlipsByUsername$.value,
            [user.username]: activeSlips,
          });
        })
      );
    });
  }

  private async getUnderdogToken(user: User): Promise<string | undefined> {
    // if we have no login info for underdog theres nothing we can do
    if (user.underdogUserInfo === undefined) {
      return;
    }

    // if we have no token data, try to auth with password
    if (user.underdogUserInfo.token === undefined) {
      const tokenOrError = await this.authWithPassword(
        user.underdogUserInfo.username,
        user.underdogUserInfo.password
      );
      if (tokenOrError instanceof Error) {
        console.error(
          `Error authenticating with password for ${user.username}`,
          tokenOrError
        );
        return undefined;
      }

      // save new token in user object
      user.underdogUserInfo.token = {
        accessToken: tokenOrError.access_token,
        refreshToken: tokenOrError.refresh_token,
        tokenExpirationDate: new Date(
          new Date().getTime() + tokenOrError.expires_in * 1000
        ).toISOString(),
      };
      this.userService.setUser(user);
      return tokenOrError.access_token;
    }

    // if we have token data, check if its expired
    const tokenIsExpired =
      new Date(user.underdogUserInfo.token.tokenExpirationDate) < new Date();
    if (tokenIsExpired) {
      console.info(`Token is expired for ${user.username}... refreshing`);
      let token = await this.authWithRefreshToken(
        user.underdogUserInfo.token.refreshToken
      );

      if (token instanceof Error) {
        console.error(`Error refreshing token for ${user.username}`, token);

        // as a last resort, try to auth with password
        console.info(`Attempting to auth with password for ${user.username}`);
        token = await this.authWithPassword(
          user.underdogUserInfo.username,
          user.underdogUserInfo.password
        );
        if (token instanceof Error) {
          console.error(
            `Error authenticating with password for ${user.username}`,
            token
          );
          return;
        }
        console.info(
          `Successfully authenticated with password for ${user.username}`
        );
      }
      console.info(`Successfully refreshed token for ${user.username}`);

      user.underdogUserInfo.token = {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        tokenExpirationDate: new Date(
          new Date().getTime() + token.expires_in * 1000
        ).toISOString(),
      };
      this.userService.setUser(user);
      return token.access_token;
    }

    return user.underdogUserInfo.token.accessToken;
  }

  private async authWithRefreshToken(
    refreshToken: string
  ): Promise<UnderdogFantasyAuthenticateResponseDto | Error> {
    const body = {
      audience: 'https://api.underdogfantasy.com',
      client_id: 'cQvYz1T2BAFbix4dYR37dyD9O0Thf1s6',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: 'offline_access',
    };

    const tokenResponse = await lastValueFrom(
      this.http.post<
        | UnderdogFantasyAuthenticateResponseDto
        | { error: string; error_description: string }
      >('/api/underdog/auth', body)
    ).catch((err: Error) => err);

    if (tokenResponse instanceof Error) {
      return tokenResponse;
    }
    if ('error' in tokenResponse) {
      return new Error(
        tokenResponse.error + ' | ' + tokenResponse.error_description
      );
    }

    return tokenResponse;
  }

  private async authWithPassword(
    username: string,
    password: string
  ): Promise<UnderdogFantasyAuthenticateResponseDto | Error> {
    const body = {
      audience: 'https://api.underdogfantasy.com',
      client_id: 'cQvYz1T2BAFbix4dYR37dyD9O0Thf1s6',
      grant_type: 'password',
      username: username,
      password: password,
      scope: 'offline_access',
    };

    const tokenResponse = await lastValueFrom(
      this.http.post<
        | UnderdogFantasyAuthenticateResponseDto
        | { error: string; error_description: string }
      >('/api/underdog/auth', body)
    ).catch((err: Error) => err);

    if (tokenResponse instanceof Error) {
      return tokenResponse;
    }
    if ('error' in tokenResponse) {
      return new Error(
        tokenResponse.error + ' | ' + tokenResponse.error_description
      );
    }

    return tokenResponse;
  }
}
