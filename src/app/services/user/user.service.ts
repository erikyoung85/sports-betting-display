import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { keyBy } from 'lodash';
import { BehaviorSubject, lastValueFrom, map } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { GetUserResponseDto } from './dtos/get-user.response.dto';
import { PostUserRequestDto } from './dtos/post-user.request.dto';
import { createUserFromDto, User } from './models/user.model';

export type UserDict = {
  [username: string]: User;
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _userDict$ = new BehaviorSubject<UserDict>({});
  readonly userDict$ = this._userDict$.asObservable();
  readonly users$ = this.userDict$.pipe(
    map((userDict) => Object.values(userDict))
  );

  toggleUserEnabled(user: User): void {
    this._userDict$.next({
      ...this._userDict$.value,
      [user.username]: {
        ...user,
        enabled: !user.enabled,
      },
    });
  }

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

    const responseUser: User = createUserFromDto(userDtoOrError);
    const userDict = {
      ...this._userDict$.value,
      [responseUser.username]: responseUser,
    };
    this._userDict$.next(userDict);
    return responseUser;
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
