import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { getUser, UserEntity } from './getUser';

export interface UpdateUserDto {
  id: number;
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
    const userDto: UpdateUserDto = request.body;

    const userQueryResult = await updateUser(userDto).catch(
      (err: Error) => err
    );

    if (userQueryResult instanceof Error) {
      return response.status(500).json(userQueryResult);
    }

    return response.status(200).json(userQueryResult);
  } catch (error) {
    return response.status(500).json(error);
  }
}

export async function updateUser(
  userDto: UpdateUserDto
): Promise<UserEntity | Error> {
  const client = await sql.connect();

  const existingUserOrError: UserEntity | Error = await getUser(
    userDto.username
  );
  if (existingUserOrError instanceof Error) {
    return existingUserOrError;
  }

  const userQueryResult = await client
    .query<UserEntity>(
      `
      UPDATE "user"
      SET 
        first_name = '${userDto.first_name}',
        last_name = '${userDto.last_name}',
        underdog_user_username = ${
          userDto.underdog_user_username
            ? `'${userDto.underdog_user_username}'`
            : null
        },
        underdog_user_access_token = ${
          userDto.underdog_user_access_token
            ? `'${userDto.underdog_user_access_token}'`
            : null
        },
        underdog_user_refresh_token = ${
          userDto.underdog_user_refresh_token
            ? `'${userDto.underdog_user_refresh_token}'`
            : null
        },
        underdog_user_token_expiration_date = ${
          userDto.underdog_user_token_expiration_date
            ? `'${userDto.underdog_user_token_expiration_date}'`
            : null
        }
      WHERE username = '${userDto.username}'
      RETURNING *;`
    )
    .catch((err: Error) => err);

  if (userQueryResult instanceof Error || userQueryResult.rows.length === 0) {
    return new Error('Error updating user in database');
  }

  const userResponse = userQueryResult.rows[0];

  return userResponse;
}
