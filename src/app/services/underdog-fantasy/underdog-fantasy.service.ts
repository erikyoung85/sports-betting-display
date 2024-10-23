import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { keyBy } from 'lodash';
import { BehaviorSubject, lastValueFrom, take } from 'rxjs';
import {
  LocalStorageService,
  UnderdogFantasyUserInfo,
} from '../local-storage/local-storage.service';
import { UnderdogFantasyAuthenticateResponseDto } from './dtos/underdog-fantasy-authenticate.response.dto';
import { UnderdogFantasyGetActiveSlipsResponseDto } from './dtos/underdog-fantasy-get-active-slips.response.dto';
import { UnderdogFantasyActiveSlip } from './models/underdog-fantasy-active-slip.model';

const USERS = [{ username: 'young.erik22@gmail.com', password: 'Packbrew00' }];
const USERS_BY_USERNAME = keyBy(USERS, (user) => user.username);

@Injectable({
  providedIn: 'root',
})
export class UnderdogFantasyService {
  private readonly baseUrl = 'https://api.underdogfantasy.com';

  userDict$ = this.localStorage.underdogFantasyUserDict$;

  private _activeSlipsByUsername$: BehaviorSubject<{
    [username: string]: UnderdogFantasyActiveSlip[] | undefined;
  }> = new BehaviorSubject({});
  activeSlipsByUsername$ = this._activeSlipsByUsername$.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly localStorage: LocalStorageService
  ) {}

  getActiveSlips(): void {
    this.userDict$.pipe(take(1)).subscribe(async (userDict) => {
      await Promise.all(
        Object.values(userDict).map(async (user) => {
          const token = await this.getToken(user);
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

          const activeSlips = UnderdogFantasyActiveSlip.fromDto(activeSlipsDto);
          this._activeSlipsByUsername$.next({
            ...this._activeSlipsByUsername$.value,
            [user.username]: activeSlips,
          });
        })
      );
    });
  }

  private async getToken(
    user: UnderdogFantasyUserInfo
  ): Promise<string | undefined> {
    const tokenIsExpired = new Date(user.tokenExpirationDate) < new Date();
    if (tokenIsExpired) {
      console.info(`Token is expired for ${user.username}... refreshing`);
      let token = await this.authWithRefreshToken(user);
      if (token instanceof Error) {
        console.error(`Error refreshing token for ${user.username}`, token);

        // as a last resort, try to auth with password
        console.info(`Attempting to auth with password for ${user.username}`);
        token = await this.authWithPassword(
          user.username,
          USERS_BY_USERNAME[user.username].password
        );
        if (token instanceof Error) {
          console.error(
            `Error authenticating with password for ${user.username}`,
            token
          );
          return;
        }
      }

      return token.access_token;
    }

    return user.token;
  }

  private async authWithRefreshToken(
    user: UnderdogFantasyUserInfo
  ): Promise<UnderdogFantasyAuthenticateResponseDto | Error> {
    const body = {
      audience: 'https://api.underdogfantasy.com',
      client_id: 'cQvYz1T2BAFbix4dYR37dyD9O0Thf1s6',
      grant_type: 'refresh_token',
      refresh_token: user.refreshToken,
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

    const userInfo: UnderdogFantasyUserInfo = {
      ...user,
      token: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpirationDate: new Date(
        new Date().getTime() + tokenResponse.expires_in * 1000
      ).toISOString(),
    };

    this.localStorage.setUnderdogFantasyUser(userInfo);
    console.info(`Token refreshed for ${user.username}`);
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

    const userInfo: UnderdogFantasyUserInfo = {
      username: username,
      token: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      tokenExpirationDate: new Date(
        new Date().getTime() + tokenResponse.expires_in * 1000
      ).toISOString(),
    };

    this.localStorage.setUnderdogFantasyUser(userInfo);
    console.info(`Authenticated with password for ${username}`);
    return tokenResponse;
  }
}
