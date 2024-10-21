export interface UnderdogFantasyAuthenticateRequestDto {
  audience: string;
  client_id: string;
  grant_type: string;
  password: string;
  scope: string;
  username: string;
  ud_client_type: string;
  ud_client_version: string;
  ud_device_id: string;
}
