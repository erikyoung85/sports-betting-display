export interface PostUserRequestDto {
  username: string;
  first_name: string;
  last_name: string;
  underdog_user_username?: string | undefined;
  underdog_user_password?: string | undefined;
  underdog_user_access_token?: string | undefined;
  underdog_user_refresh_token?: string | undefined;
  underdog_user_token_expiration_date?: string | undefined;
}
