import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { UserEntity } from './getUser';

const ADMIN_PASSWORD = 'nodummies';

export interface RemoveUserDto {
  username: string;
  admin_password: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const removeUserDto: RemoveUserDto = request.body;

    if (removeUserDto.admin_password !== ADMIN_PASSWORD) {
      return response.status(401).send('Admin password is incorrect');
    }

    const removeUserResult = await removeUser(removeUserDto).catch(
      (err: Error) => err
    );
    if (removeUserResult instanceof Error) {
      return response.status(500).send(removeUserResult.message);
    }

    return response.status(200).json(removeUserResult);
  } catch (error) {
    return response.status(500).json(error);
  }
}

export async function removeUser(
  removeUserDto: RemoveUserDto
): Promise<{ success: true } | Error> {
  const client = await sql.connect();

  const userQueryResult = await client
    .query<UserEntity>(
      `
      DELETE FROM "user"
      WHERE username = '${removeUserDto.username}';
      `
    )
    .catch((err: Error) => err);

  if (userQueryResult instanceof Error) {
    return new Error('Error removing user from database');
  }

  return { success: true };
}
