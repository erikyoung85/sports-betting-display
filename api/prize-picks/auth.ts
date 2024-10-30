import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { getUser, UserEntity } from '../getUser';
import { UnderdogAuthDto } from './dtos/underdog-auth.dto';

interface requestDto {
  username?: string;
  underdog_username: string;
  underdog_password: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const body: requestDto = request.body;

    let user: UserEntity | undefined;
    if (body.username) {
      const userOrError = await getUser(body.username).catch(
        (err: Error) => err
      );
      if (userOrError instanceof Error) {
        return response.status(500).send(userOrError.message);
      }
      user = userOrError;
    }

    if (user && user.underdog_auth_failed_attempts >= 1) {
      await updateUnderdogFailedAuthAttempt(user.username);
      return response
        .status(429)
        .send(
          'Will not attempt to login user after 2 failed attempts. Contact administrator.'
        );
    }

    const requestBody = {
      audience: 'https://api.underdogfantasy.com',
      client_id: 'cQvYz1T2BAFbix4dYR37dyD9O0Thf1s6',
      grant_type: 'password',
      username: body.underdog_username,
      password: body.underdog_password,
      scope: 'offline_access',
    };

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(requestBody),
    };

    const tokenResponse = await fetch(
      'https://login.underdogsports.com/oauth/token',
      requestOptions
    ).catch((err: Error) => err);

    // internal error handling
    if (tokenResponse instanceof Error) {
      if (user) await updateUnderdogFailedAuthAttempt(user.username);

      return response.status(500).send('Error authenticating user');
    }

    // handle too many requests error
    if (tokenResponse.status === 429) {
      if (user) await updateUnderdogFailedAuthAttempt(user.username);
      const tryAgainAfter = tokenResponse.headers.get('retry-after');
      return response
        .status(tokenResponse.status)
        .send(`too many requests, try again after ${tryAgainAfter} seconds`);
    }

    // external error message handling from underdog
    if (tokenResponse.status !== 200 || tokenResponse.ok === false) {
      if (user) await updateUnderdogFailedAuthAttempt(user.username);

      const errorJson: { error: string; error_description: string } =
        JSON.parse(await tokenResponse.text());
      return response
        .status(tokenResponse.status)
        .send(errorJson.error_description);
    }

    // save new token info for user
    const tokenResponseJson: UnderdogAuthDto = JSON.parse(
      await tokenResponse.text()
    );

    // save token info if user exists
    if (user) {
      await saveUnderdogAuth(
        user.username,
        tokenResponseJson,
        body.underdog_username
      ).catch((err: Error) => err);
    }

    return response.json(tokenResponseJson);
  } catch (error) {
    return response.status(500).send(error);
  }
}

export async function saveUnderdogAuth(
  username: string,
  auth: UnderdogAuthDto,
  underdog_username?: string
): Promise<{ success: boolean } | Error> {
  const client = await sql.connect();

  const tokenExpirationDateStr = new Date(
    new Date().getTime() + auth.expires_in * 1000
  ).toISOString();

  const responseOrError = await client
    .query(
      `
    UPDATE "user"
    SET 
      ${
        underdog_username
          ? `underdog_user_username = '${underdog_username}',`
          : ''
      }
      underdog_user_access_token = '${auth.access_token}',
      underdog_user_refresh_token = '${auth.refresh_token}',
      underdog_user_token_expiration_date = '${tokenExpirationDateStr}'
    WHERE username = '${username}';`
    )
    .catch((err: Error) => err);

  if (responseOrError instanceof Error) {
    return new Error('Error saving Underdog auth information');
  }

  return { success: true };
}

export async function updateUnderdogFailedAuthAttempt(
  username: string
): Promise<{ success: boolean } | Error> {
  const client = await sql.connect();

  const responseOrError = await client
    .query(
      `
    UPDATE "user"
    SET 
      underdog_auth_failed_attempts = underdog_auth_failed_attempts + 1
    WHERE username = '${username}';`
    )
    .catch((err: Error) => err);

  if (responseOrError instanceof Error) {
    return new Error('Error updating Underdog auth failed attempts');
  }

  return { success: true };
}
