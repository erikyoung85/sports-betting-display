import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { User } from './models/user.model';

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
];

export type UserDict = {
  [username: string]: User;
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  _userDict$ = new BehaviorSubject<UserDict>(
    this.localStorage.getItem<UserDict>('users') ?? {}
  );
  userDict$ = this._userDict$.asObservable();
  users$ = this.userDict$.pipe(map((userDict) => Object.values(userDict)));

  setUser(user: User): void {
    const userDict = this._userDict$.value;
    userDict[user.username] = user;
    this.localStorage.setItem('users', userDict);
    this._userDict$.next(userDict);
  }

  constructor(private readonly localStorage: LocalStorageService) {}
}
