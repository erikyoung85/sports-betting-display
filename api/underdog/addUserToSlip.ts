import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { getUsernamesBySlip } from './getUsernamesBySlip';

interface requestDto {
  slip_id: string;
  username: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const requestBody: requestDto = request.body;

    const usernamesBySlipOrError = await addUserToSlip(
      requestBody.slip_id,
      requestBody.username
    ).catch((err: Error) => err);

    if (usernamesBySlipOrError instanceof Error) {
      return response.status(500).json(usernamesBySlipOrError);
    }

    return response.status(200).json(usernamesBySlipOrError);
  } catch (error) {
    return response.status(500).json(error);
  }
}

export async function addUserToSlip(
  slip_id: string,
  username: string
): Promise<{ [slipId: string]: string[] } | Error> {
  try {
    const client = await sql.connect();
    const queryResult = await client.query(
      `
      INSERT INTO slip_id_to_username (slip_id, username)
      VALUES ('${slip_id}', '${username}');
    `
    );

    return await getUsernamesBySlip();
  } catch (error) {
    return new Error('error occurred while fetching user from database');
  }
}
