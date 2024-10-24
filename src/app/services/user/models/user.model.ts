export interface User {
  username: string;
  firstName: string;
  lastName: string;
  underdogUserInfo?: {
    username: string;
    password: string;
    token?: {
      accessToken: string;
      refreshToken: string;
      tokenExpirationDate: string;
    };
  };
}
