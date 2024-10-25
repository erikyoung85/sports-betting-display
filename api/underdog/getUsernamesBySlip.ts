import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const usernamesBySlipOrError = await getUsernamesBySlip().catch(
      (err: Error) => err
    );

    if (usernamesBySlipOrError instanceof Error) {
      return response.status(500).json(usernamesBySlipOrError);
    }

    return response.status(200).json(usernamesBySlipOrError);
  } catch (error) {
    return response.status(500).json(error);
  }
}

export async function getUsernamesBySlip(): Promise<
  { [slipId: string]: string[] } | Error
> {
  try {
    const client = await sql.connect();
    const queryResult = await client.query<{
      slip_id: string;
      username: string;
    }>(`
        SELECT *
        FROM slip_id_to_username
    `);

    const slipIdToUsername: { [slipId: string]: string[] } = {};
    queryResult.rows.forEach((row) => {
      if (slipIdToUsername[row.slip_id] === undefined) {
        slipIdToUsername[row.slip_id] = [];
      }
      slipIdToUsername[row.slip_id].push(row.username);
    });

    return slipIdToUsername;
  } catch (error) {
    return new Error('error occurred while fetching user from database');
  }
}
