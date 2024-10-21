import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { UnderdogFantasyAuthenticateRequestDto } from './dtos/underdog-fantasy-authenticate.request.dto';
import { UnderdogFantasyAuthenticateResponseDto } from './dtos/underdog-fantasy-authenticate.response.dto';
import { UnderdogFantasyGetActiveSlipsResponseDto } from './dtos/underdog-fantasy-get-active-slips.response.dto';

@Injectable({
  providedIn: 'root',
})
export class UnderdogFantasyService {
  private readonly baseUrl = 'https://api.underdogfantasy.com';
  private token: UnderdogFantasyAuthenticateResponseDto | undefined = {
    access_token:
      'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNnRTM4R1FUTW1lcVA5djFYVllEUCJ9.eyJ1ZF9zdWIiOiI0NWM5MjZjYS0wNDRmLTQ5MDgtYThhOS0zYTFjNWQ1MmQxOTEiLCJ1ZF9lbWFpbCI6InlvdW5nLmVyaWsyMkBnbWFpbC5jb20iLCJ1ZF91c2VybmFtZSI6ImVyaWt5b3VuZzg1IiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi51bmRlcmRvZ3Nwb3J0cy5jb20vIiwic3ViIjoiYXV0aDB8NjcxMWRkMDVkYzJlNmVmNWJiMzU1YmIxIiwiYXVkIjoiaHR0cHM6Ly9hcGkudW5kZXJkb2dmYW50YXN5LmNvbSIsImlhdCI6MTcyOTQ3MTQxNywiZXhwIjoxNzI5NTU3ODE3LCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwiZ3R5IjoicGFzc3dvcmQiLCJhenAiOiJjUXZZejFUMkJBRmJpeDRkWVIzN2R5RDlPMFRoZjFzNiJ9.UmMHEt5z4qruS5pFoPBxsuhKf3piTIef6MEYr6QvXNVPU_ZD8NCmfeB97Xrct9eMoKdC4Vdel5sD_udjPybR5pc99D0LkUv69ijURqrYPKmsauyLT72M0mtuSsMpDtwL5Vo-N-9GjbgBG-Api55E23zQs-zhO_VRE-V0N6fyidWfSnvCq9QtwbWyggCeF1s3BHN4vPPoGTkFRfpLfUEG-xLwoKFChkNMPFgdFLYcd2Rc6d-0wBkqV_rks41SjWF_6JYvG08UMkMzv1WsoJjIZ2TBesFT5ScK8Nsg5VhJPWHogV1m-frhhmFuEGiq8LJq6WE5nZbzpKw5RUxectGGqA',
    expires_in: 0,
    refresh_token: '',
    scope: '',
    token_type: 'bearer',
  };

  constructor(private http: HttpClient) {}

  getActiveSlips(): Observable<
    UnderdogFantasyGetActiveSlipsResponseDto['data']['entry_slips'] | undefined
  > {
    return this.getToken().pipe(
      switchMap((token) => {
        if (token === undefined) {
          return of(undefined);
        }

        const headers = new HttpHeaders({
          Authorization: `Bearer ${token.access_token}`,
        });

        return this.http
          .get<UnderdogFantasyGetActiveSlipsResponseDto>(
            `${this.baseUrl}/v5/user/active_entry_slips`,
            {
              headers,
            }
          )
          .pipe(map((response) => response.data.entry_slips));
      })
    );
  }

  private getToken(): Observable<
    UnderdogFantasyAuthenticateResponseDto | undefined
  > {
    if (this.token) {
      return of(this.token);
    }

    const body: UnderdogFantasyAuthenticateRequestDto = {
      audience: 'https://api.underdogfantasy.com',
      client_id: 'cQvYz1T2BAFbix4dYR37dyD9O0Thf1s6',
      grant_type: 'password',
      password: 'Packbrew00',
      scope: 'offline_access',
      username: 'young.erik22@gmail.com',
      ud_client_type: 'web',
      ud_client_version: '20241017171140',
      ud_device_id: '5d8af858-b427-4777-8069-71f705b04b96',
    };

    return this.http
      .post<UnderdogFantasyAuthenticateResponseDto>(
        'https://login.underdogsports.com/oauth/token',
        body
      )
      .pipe(
        tap((token) => {
          this.token = token;
        }),
        catchError((error: Error) => {
          return of(undefined);
        })
      );
  }
}
