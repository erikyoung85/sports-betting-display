import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { UserEntity } from './getUser';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const userEntitiesOrError = await getAllUsers().catch((err: Error) => err);

    if (userEntitiesOrError instanceof Error) {
      return response.status(500).json(userEntitiesOrError);
    }

    return response.status(200).json(userEntitiesOrError);
  } catch (error) {
    return response.status(500).json(error);
  }
}

export async function getAllUsers(): Promise<UserEntity[] | Error> {
  try {
    const client = await sql.connect();
    const queryResult = await client.query<UserEntity>(`
            SELECT *
            FROM "user"
        `);

    if (queryResult.rows.length === 0) {
      return new Error('No users found');
    }
    const userEntities = queryResult.rows;
    return userEntities;
  } catch (error) {
    return new Error('error occurred while fetching users from database');
  }
}
