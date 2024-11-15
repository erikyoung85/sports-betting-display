import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export interface UserEntity {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  underdog_user_username: string | null;
  underdog_user_access_token: string | null;
  underdog_user_refresh_token: string | null;
  underdog_user_token_expiration_date: string | null;
  underdog_auth_failed_attempts: number;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const { username } = request.query;

    const userEntityOrError = await getUser(username as string).catch(
      (err: Error) => err
    );

    if (userEntityOrError instanceof Error) {
      return response.status(500).send(userEntityOrError.message);
    }

    return response.status(200).json(userEntityOrError);
  } catch (error) {
    return response.status(500).json(error);
  }
}

export async function getUser(username: string): Promise<UserEntity | Error> {
  try {
    const client = await sql.connect();
    const queryResult = await client.query<UserEntity>(`
            SELECT 
                id,
                username,
                first_name,
                last_name,
                underdog_user_username,
                underdog_user_access_token,
                underdog_user_refresh_token,
                underdog_user_token_expiration_date,
                underdog_auth_failed_attempts
            FROM "user"
            WHERE "user".username = '${username}';
        `);

    if (queryResult.rows.length === 0) {
      return new Error('User not found');
    }
    const userEntity = queryResult.rows[0];
    return userEntity;
  } catch (error) {
    return new Error('error occurred while fetching user from database');
  }
}
