import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { keyBy } from 'lodash';
import { BehaviorSubject, lastValueFrom, map } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { GetUserResponseDto } from './dtos/get-user.response.dto';
import { PostUserRequestDto } from './dtos/post-user.request.dto';
import { createUserFromDto, User } from './models/user.model';

const USERS: User[] = [
  {
    username: 'erikyoung85',
    firstName: 'Erik',
    lastName: 'Young',
    underdogUserInfo: {
      username: 'young.erik22@gmail.com',
      password: 'Packbrew00',
      //   token: {
      //     accessToken:
      //       'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNnRTM4R1FUTW1lcVA5djFYVllEUCJ9.eyJ1ZF9zdWIiOiI0NWM5MjZjYS0wNDRmLTQ5MDgtYThhOS0zYTFjNWQ1MmQxOTEiLCJ1ZF9lbWFpbCI6InlvdW5nLmVyaWsyMkBnbWFpbC5jb20iLCJ1ZF91c2VybmFtZSI6ImVyaWt5b3VuZzg1IiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi51bmRlcmRvZ3Nwb3J0cy5jb20vIiwic3ViIjoiYXV0aDB8NjcxMWRkMDVkYzJlNmVmNWJiMzU1YmIxIiwiYXVkIjoiaHR0cHM6Ly9hcGkudW5kZXJkb2dmYW50YXN5LmNvbSIsImlhdCI6MTcyOTY2NTE1NCwiZXhwIjoxNzI5NzUxNTU0LCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwiZ3R5IjoicGFzc3dvcmQiLCJhenAiOiJjUXZZejFUMkJBRmJpeDRkWVIzN2R5RDlPMFRoZjFzNiJ9.kdXaDDwwb0_FLS51slJaZ5NRwIFJrW2ci6Q2pFUQMN28DH8Co1D0y8BJlxYRh9rzeBGS5fsDm3sRBnMbqXUKs_bp20QDbaMnVw4n6TVE1BIPCm3j88RrKtor1FC6r4E9rpLpNmA7YCdBOK2HPGhuWICxUPPZW0UEZAUoRsrXhyJaGFVxq0yOK1-lGYdoyeqUKeTxJqGgJxy-dNkIiF2fCPyvtLqVk2bNTgbPXLssA5YDRvAxUuqYj6ZaEkgjwZR7Fnn4_PR0MGNzLr9f3xgkeS-Hqo17r3BH9x58D-7CqVOEmpwoZkODdap5Ae3rJOZP7XeN1inRcgpCtXkGfbmuxw',
      //     refreshToken:
      //       'v1.MUb_zzkoN-j3h55Gp7hQ8n01JWmO8xcdC4NiK6aWIOWly6XiqVdtdOeThFg4bed6nSSFMkPpCNs5EtHydDILSvQ',
      //     tokenExpirationDate: '2024-10-24T06:32:34.133Z',
      //   },
    },
  },
  {
    username: 'jedwhetstone',
    firstName: 'Jed',
    lastName: 'Whetstone',
    underdogUserInfo: {
      username: 'whetstonejed@yahoo.com',
      password: 'iR3allYH8ITee!',
    },
  },
  {
    username: 'samsmith14419',
    firstName: 'Sam',
    lastName: 'Smith',
    underdogUserInfo: {
      username: 'smsmith14419@gmail.com',
      password: 'Kateyoungroxs1',
      token: {
        accessToken:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNnRTM4R1FUTW1lcVA5djFYVllEUCJ9.eyJ1ZF9zdWIiOiJiYjNiZDgxMC1hMmEyLTQzN2YtOTJhMS1iN2EwMjYzZDkyMTUiLCJ1ZF9lbWFpbCI6InNtc21pdGgxNDQxOUBnbWFpbC5jb20iLCJ1ZF91c2VybmFtZSI6InNhbTE0NDE5IiwiaXNzIjoiaHR0cHM6Ly9sb2dpbi51bmRlcmRvZ3Nwb3J0cy5jb20vIiwic3ViIjoiYXV0aDB8NjcxYWNmNDQyYzZiMGQyZmE0NTAxMzJlIiwiYXVkIjoiaHR0cHM6Ly9hcGkudW5kZXJkb2dmYW50YXN5LmNvbSIsImlhdCI6MTcyOTgxMTI4MywiZXhwIjoxNzI5ODk3NjgzLCJzY29wZSI6Im9mZmxpbmVfYWNjZXNzIiwiZ3R5IjoicGFzc3dvcmQiLCJhenAiOiJjUXZZejFUMkJBRmJpeDRkWVIzN2R5RDlPMFRoZjFzNiJ9.EsmLPcoEwb9g2TeuOPn43GVGV1eSImzJxuEKjWZHJOEThm5aonzdtGOS61_nGzfcW-sC_MlrfDxywEgTSlOtFIbfYvKoj5FucIxePJZUSuFOBD5jx7qVzxEQt467Yc0QaHk7OrqY9utVTGFN0TNKeX6ahRmD6C88onEK5HIqYm1C58N3U81pLzHPzHQEpv-v_zvev-InrDhFCR8gs20jt3lmnuFmN0WxwJnfUYPx_0hvBqFZR4wusmGI9K9FuPe9FptzIOBv5yB78EYCrHJrnDF2GgJNnId_w6KYzhS1XINo2C9TVIsjMCVWZDU_fqUEKQNMX6OUnRv1X5wM2XLgsQ',
        refreshToken:
          'v1.MaIwXRUPfqMqsPoK7_mg3b2u63O4Q4WrAEpN8InXo3lGgVHd3iKutkrgzHxvG5Kk2ImCqeC193DRlVLCc3-7AYs',
        tokenExpirationDate: new Date(
          new Date().getTime() + 86400 * 1000
        ).toISOString(),
      },
    },
  },
  {
    username: 'griffcook69',
    firstName: 'Griffin',
    lastName: 'Cook',
    underdogUserInfo: {
      username: 'gwcook26@gmail.com',
      password: 'Gwcgwc369?!?',
      token: {
        accessToken:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNnRTM4R1FUTW1lcVA5djFYVllEUCJ9.eyJ1ZF9zdWIiOiIxY2NhMWRiYy00YzkyLTRiNzQtOGE4ZS1iZDY5NDA2ZjBkMDgiLCJ1ZF9lbWFpbCI6Imd3Y29vazI2QGdtYWlsLmNvbSIsInVkX3VzZXJuYW1lIjoiZ3djb29rMjYiLCJpc3MiOiJodHRwczovL2xvZ2luLnVuZGVyZG9nc3BvcnRzLmNvbS8iLCJzdWIiOiJhdXRoMHw2NzExNTUzYzMxZDVhNjU0ZWY5ZDk4N2IiLCJhdWQiOiJodHRwczovL2FwaS51bmRlcmRvZ2ZhbnRhc3kuY29tIiwiaWF0IjoxNzI5ODEyNDMwLCJleHAiOjE3Mjk4OTg4MzAsInNjb3BlIjoib2ZmbGluZV9hY2Nlc3MiLCJndHkiOiJwYXNzd29yZCIsImF6cCI6ImNRdll6MVQyQkFGYml4NGRZUjM3ZHlEOU8wVGhmMXM2In0.Bj2zcybK20EVvVjsvOia3XdRTnPZEb1VhJoH-C79zFKVeh4LSJEqyhtKBTgpy4q7vCzKClI93A-ZoW1uzjW9zYXEmPD_2sctry4NO82voc1m4rVhgPoZOvj_x3JBPG5b3izfGZS6wKzUGQG5hXFq3S77Mq1Th-yWjsZLlB-xC1HJ2gqcwfZVUVnpIfRr2TfgJLK_dn4kVTTmSLkFOuvwJglON7FhWdHOUK4ZHNHa_vJ5SmsrzWFk8qCgMasfePzJT6ngU389lv3ZceH6YB4lqMha1QIuSjkK3RmJbzL4zV1SHgFPWclWYDLIzSbuVSLERQL5i8Ej3OC5bvhJ2xBKdQ',
        refreshToken:
          'v1.MRF9K8TUtRwFx4fAtfLFRkSjnq88oUbkUjhXzCpg5uZp92ZZfbpYHUy0ANa4vSB54NfyVc4HIGfrX9c9c_o0DBc',
        tokenExpirationDate: new Date(
          new Date().getTime() + 86400 * 1000
        ).toISOString(),
      },
    },
  },
];

export type UserDict = {
  [username: string]: User;
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  _userDict$ = new BehaviorSubject<UserDict>({});
  userDict$ = this._userDict$.asObservable();
  users$ = this.userDict$.pipe(map((userDict) => Object.values(userDict)));

  async getUser(username: string): Promise<User | undefined> {
    const userDtoOrError = await lastValueFrom(
      this.http.get<GetUserResponseDto>('/api/getUser', {
        params: {
          username: username,
        },
      })
    ).catch((err: HttpErrorResponse) => err);

    if (userDtoOrError instanceof HttpErrorResponse) {
      console.error(userDtoOrError);
      return undefined;
    }

    return createUserFromDto(userDtoOrError);
  }

  async getAllUsers(): Promise<void> {
    const userDtosOrError = await lastValueFrom(
      this.http.get<GetUserResponseDto[]>('/api/getAllUsers')
    ).catch((err: HttpErrorResponse) => err);

    if (userDtosOrError instanceof HttpErrorResponse || !userDtosOrError) {
      console.error(userDtosOrError);
      return;
    }

    const users = userDtosOrError.map((userDto) => createUserFromDto(userDto));
    const userDict = keyBy(users, (users) => users.username);
    this._userDict$.next(userDict);
  }

  async setUser(user: User): Promise<void> {
    const userRequestDto: PostUserRequestDto = {
      username: user.username,
      first_name: user.firstName,
      last_name: user.lastName,
      underdog_user_username: user.underdogUserInfo?.username,
      underdog_user_password: user.underdogUserInfo?.password,
      underdog_user_access_token: user.underdogUserInfo?.token?.accessToken,
      underdog_user_refresh_token: user.underdogUserInfo?.token?.refreshToken,
      underdog_user_token_expiration_date:
        user.underdogUserInfo?.token?.tokenExpirationDate,
    };

    // update or create user in database
    let responseDtoOrError: GetUserResponseDto | HttpErrorResponse;
    if (this._userDict$.value[user.username] !== undefined) {
      responseDtoOrError = await lastValueFrom(
        this.http.post<GetUserResponseDto>('/api/updateUser', userRequestDto)
      ).catch((error: HttpErrorResponse) => error);
      if (responseDtoOrError instanceof HttpErrorResponse) {
        console.error('update user failed, user:', user);
        return;
      }
    } else {
      responseDtoOrError = await lastValueFrom(
        this.http.post<GetUserResponseDto>('/api/postUser', userRequestDto)
      ).catch((err: HttpErrorResponse) => err);
      if (responseDtoOrError instanceof HttpErrorResponse) {
        console.error('post user failed, user:', user);
        return;
      }
    }

    const responseUser = createUserFromDto(responseDtoOrError);

    const userDict = {
      ...this._userDict$.value,
      [responseUser.username]: responseUser,
    };
    this._userDict$.next(userDict);
  }

  async removeUser(user: User): Promise<void> {}

  constructor(
    private readonly localStorage: LocalStorageService,
    private readonly http: HttpClient
  ) {
    this.getAllUsers();
  }
}
