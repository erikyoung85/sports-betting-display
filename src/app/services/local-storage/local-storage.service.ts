import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UnderdogFantasyUserInfo {
  username: string;
  token: string;
  refreshToken: string;
  tokenExpirationDate: string;
}
export type UnderdogFantasyUserDict = {
  [username: string]: UnderdogFantasyUserInfo;
};

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  _underdogFantasyUserDict$ = new BehaviorSubject<UnderdogFantasyUserDict>(
    this.getItem<UnderdogFantasyUserDict>('underdog_users') ?? {}
  );
  underdogFantasyUserDict$ = this._underdogFantasyUserDict$.asObservable();
  setUnderdogFantasyUser(user: UnderdogFantasyUserInfo): void {
    const userDict = this._underdogFantasyUserDict$.value;
    userDict[user.username] = user;
    this.setItem('underdog_users', userDict);
    this._underdogFantasyUserDict$.next(userDict);
  }

  private getItem<T>(key: string): T | undefined {
    const itemRaw = localStorage.getItem(key);
    if (itemRaw === null) {
      return undefined;
    }

    const item: T = JSON.parse(itemRaw);
    return item;
  }

  private setItem<T>(key: string, item: T): void {
    localStorage.setItem(key, JSON.stringify(item));
  }
}
