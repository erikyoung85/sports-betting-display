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
  private readonly baseUrl = '/test';

  userDict$ = this.localStorage.underdogFantasyUserDict$;

  private _activeSlipsByUsername$: BehaviorSubject<{
    [username: string]: UnderdogFantasyActiveSlip[] | undefined;
  }> = new BehaviorSubject({});
  activeSlipsByUsername$ = this._activeSlipsByUsername$.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly localStorage: LocalStorageService
  ) {
    // const user: UnderdogFantasyUserInfo = {
    //   username: 'young.erik22@gmail.com',
    //   token:
    //     'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNnRTM4R1FUTW1lcVA5djFYVllEUCJ9.eyJ1ZF9zdWIiOiI0NWM5MjZjYS0wNDRmLTQ5MDgtYThhOS0zYTFjNWQ1MmQxOTEiLCJ1ZF9lbWFpbCI6InlvdW5nLmVyaWsyMkBnbWFpbC5jb20iLCJ1ZF91c2VybmFtZSI6ImVyaWt5b3VuZzg1IiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi51bmRlcmRvZ3Nwb3J0cy5jb20vIiwic3ViIjoiYXV0aDB8NjcxMWRkMDVkYzJlNmVmNWJiMzU1YmIxIiwiYXVkIjoiaHR0cHM6Ly9hcGkudW5kZXJkb2dmYW50YXN5LmNvbSIsImlhdCI6MTcyOTYxODg2MSwiZXhwIjoxNzI5NzA1MjYxLCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwiZ3R5IjpbInJlZnJlc2hfdG9rZW4iLCJwYXNzd29yZCJdLCJhenAiOiJjUXZZejFUMkJBRmJpeDRkWVIzN2R5RDlPMFRoZjFzNiJ9.K5k6aPpTBJdn1QhvqS0m9b9TnbwolmWfzgHf2Sps1c9yg9hOXRjEkNzRbBAfmYsckdgJWRTzJ64HdbV15b7pC91f_fwhOzzmC2uIvHzGkbCg7WR-TpwRMtLfGPwdR6cpYj-quEQGethj3XngbOai9tzMbJrpIbsV39u_pdSOwO03oFMQ6y5un35orNZmAQ0n2n28sAk0DPaIhnln57p13YXk473C3_bgl-wxTMv3gnBX-WUjL1FCTOCKQbsJXjUVbsf8hQ_OXz_aPV3FPBRAyLJ1PpmdxRhIOoFEPLXOkuJTSJ8eCQAzuvMsV8EwsodtRQO3Z4Nm0GMPZid1eX886w',
    //   refreshToken:
    //     'v1.M0KPZ4h16dJ4TVROw_4jkjXO1QJlmPzj06xraHUO-3lhhDBJbKoabQU88yIve9J6vjsTtcmeGvvCApH14AmyMwI',
    //   tokenExpirationDate: new Date(
    //     new Date().getTime() + 86400 * 1000
    //   ).toISOString(),
    // };
    // this.localStorage.setUnderdogFantasyUser(user);
  }

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
      console.log('Token is expired... refreshing');
      const token = await this.authWithRefreshToken(user);
      if (token instanceof Error) {
        console.error('Error refreshing token', token);
        return;
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

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const tokenResponse = await lastValueFrom(
      this.http.post<UnderdogFantasyAuthenticateResponseDto>(
        '/underdogsports-login',
        body,
        {
          observe: 'response' as 'response',
          headers: headers,
        }
      )
    ).catch((err: Error) => err);

    if (
      tokenResponse instanceof Error ||
      tokenResponse.status !== 200 ||
      tokenResponse.body === null
    ) {
      return Error('Error refreshing token');
    }

    const userInfo: UnderdogFantasyUserInfo = {
      ...user,
      token: tokenResponse.body.access_token,
      refreshToken: tokenResponse.body.refresh_token,
      tokenExpirationDate: new Date(
        new Date().getTime() + tokenResponse.body.expires_in * 1000
      ).toISOString(),
    };

    this.localStorage.setUnderdogFantasyUser(userInfo);
    return tokenResponse.body;
  }

  private async authWithPassword(
    username: string,
    password: string
  ): Promise<UnderdogFantasyAuthenticateResponseDto | Error> {
    const body = {
      audience: 'https://api.underdogfantasy.com',
      grant_type: 'password',
      username: username,
      password: password,
      scope: 'offline_access',
    };

    debugger;
    const tokenResponse = await lastValueFrom(
      this.http.post<UnderdogFantasyAuthenticateResponseDto>(
        'https://login.underdogsports.com/oauth/token',
        body
      )
    ).catch((err: Error) => err);

    if (tokenResponse instanceof Error) {
      return tokenResponse;
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
    return tokenResponse;
  }
}
