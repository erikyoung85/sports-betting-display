import { Injectable } from '@angular/core';
import { User } from '../user/models/user.model';

export interface UnderdogFantasyUserInfo {
  username: string;
  token: string;
  refreshToken: string;
  tokenExpirationDate: string;
}
export type UserDict = {
  [username: string]: User;
};

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  getItem<T>(key: string): T | undefined {
    const itemRaw = localStorage.getItem(key);
    if (itemRaw === null) {
      return undefined;
    }

    const item: T = JSON.parse(itemRaw);
    return item;
  }

  setItem<T>(key: string, item: T): void {
    localStorage.setItem(key, JSON.stringify(item));
  }
}
