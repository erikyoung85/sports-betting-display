import { GetUserResponseDto } from '../dtos/get-user.response.dto';

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

export function createUserFromDto(userDto: GetUserResponseDto): User {
  const user: User = {
    username: userDto.username,
    firstName: userDto.first_name,
    lastName: userDto.last_name,
  };

  if (userDto.underdog_user_username && userDto.underdog_user_password) {
    user.underdogUserInfo = {
      username: userDto.underdog_user_username,
      password: userDto.underdog_user_password,
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
