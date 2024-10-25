export interface GetUserResponseDto {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  underdog_user_username: string | null;
  underdog_user_password: string | null;
  underdog_user_access_token: string | null;
  underdog_user_refresh_token: string | null;
  underdog_user_token_expiration_date: string | null;
}