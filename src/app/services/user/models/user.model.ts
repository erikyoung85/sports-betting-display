import { GetUserResponseDto } from '../dtos/get-user.response.dto';

export interface User {
  username: string;
  firstName: string;
  lastName: string;
  underdogUserInfo?: UnderdogUserInfo;
  enabled: boolean;
}

export interface UnderdogUserInfo {
  username: string;
  token?: {
    accessToken: string;
    refreshToken: string;
    tokenExpirationDate: string;
  };
}

export function createUserFromDto(userDto: GetUserResponseDto): User {
  const user: User = {
    username: userDto.username,
    firstName: userDto.first_name,
    lastName: userDto.last_name,
    enabled: true,
  };

  if (userDto.underdog_user_username) {
    user.underdogUserInfo = {
      username: userDto.underdog_user_username,
    };

    if (
      userDto.underdog_user_access_token &&
      userDto.underdog_user_refresh_token &&
      userDto.underdog_user_token_expiration_date
    ) {
      user.underdogUserInfo.token = {
        accessToken: userDto.underdog_user_access_token,
        refreshToken: userDto.underdog_user_refresh_token ?? undefined,
        tokenExpirationDate: userDto.underdog_user_token_expiration_date,
      };
    }
  }

  return user;
}
