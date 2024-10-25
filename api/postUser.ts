import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { UserEntity } from './getUser';
import { stringOrNull } from './utils';

export interface PostUserDto {
  username: string;
  first_name: string;
  last_name: string;
  underdog_user_username: string | undefined;
  underdog_user_access_token: string | undefined;
  underdog_user_refresh_token: string | undefined;
  underdog_user_token_expiration_date: string | undefined;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const userDto: PostUserDto = request.body;

    const userQueryResult = await postUser(userDto).catch((err: Error) => err);
    if (userQueryResult instanceof Error) {
      return response.status(500).json(userQueryResult);
    }

    return response.status(200).json(userQueryResult);
  } catch (error) {
    return response.status(500).json(error);
  }
}

export async function postUser(
  userDto: PostUserDto
): Promise<UserEntity | Error> {
  const client = await sql.connect();

  const userQueryResult = await client
    .query<UserEntity>(
      `
      INSERT INTO "user" (username, first_name, last_name, underdog_user_username, underdog_user_password, underdog_user_access_token, underdog_user_refresh_token, underdog_user_token_expiration_date)
      VALUES (
        '${userDto.username}', 
        '${userDto.first_name}', 
        '${userDto.last_name}', 
        ${stringOrNull(userDto.underdog_user_username)}, 
        ${null}, 
        ${stringOrNull(userDto.underdog_user_access_token)}, 
        ${stringOrNull(userDto.underdog_user_refresh_token)}, 
        ${stringOrNull(userDto.underdog_user_token_expiration_date)})
      RETURNING *;`
    )
    .catch((err: Error) => err);

  if (userQueryResult instanceof Error || userQueryResult.rows.length === 0) {
    return new Error('Error inserting user into database');
  }

  const userResponse = userQueryResult.rows[0];

  return userResponse;
}
