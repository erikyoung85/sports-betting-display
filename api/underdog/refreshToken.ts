import { VercelRequest, VercelResponse } from '@vercel/node';
import { UnderdogAuthDto } from '../dtos/underdog-auth.dto';
import { getUser, UserEntity } from '../getUser';
import {
  resetUnderdogFailedAuthAttempt,
  saveUnderdogAuth,
  updateUnderdogFailedAuthAttempt,
} from './auth';

interface requestDto {
  username: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const body: requestDto = request.body;

    const user: UserEntity | Error = await getUser(body.username).catch(
      (err: Error) => err
    );
    if (user instanceof Error) {
      return response.status(500).send(user.message);
    }
    if (user.underdog_auth_failed_attempts >= 1) {
      await updateUnderdogFailedAuthAttempt(body.username);
      return response
        .status(429)
        .send(
          'Will not attempt to refresh token after 2 failed attempts. Contact administrator.'
        );
    }
    if (!user.underdog_user_refresh_token) {
      return response
        .status(400)
        .send('User does not have an underdog refresh token');
    }
    const expirationDate = user.underdog_user_token_expiration_date
      ? new Date(user.underdog_user_token_expiration_date)
      : undefined;
    if (expirationDate !== undefined && expirationDate > new Date()) {
      return response.status(200).json(user);
    }

    const requestBody = {
      audience: 'https://api.underdogfantasy.com',
      client_id: 'cQvYz1T2BAFbix4dYR37dyD9O0Thf1s6',
      grant_type: 'refresh_token',
      refresh_token: user.underdog_user_refresh_token,
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
      await updateUnderdogFailedAuthAttempt(body.username);
      return response.status(500).send('Error refreshing token');
    }

    // too many requests error
    if (tokenResponse.status === 429) {
      await updateUnderdogFailedAuthAttempt(body.username);
      const tryAgainAfter = tokenResponse.headers.get('retry-after');
      return response
        .status(tokenResponse.status)
        .send(`too many requests, try again after ${tryAgainAfter} seconds`);
    }

    // external error message handling from underdog
    if (tokenResponse.status !== 200 || tokenResponse.ok === false) {
      await updateUnderdogFailedAuthAttempt(body.username);
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
    const saveAuthResponse = await saveUnderdogAuth(
      body.username,
      tokenResponseJson
    ).catch((err: Error) => err);

    // error saving new token
    if (saveAuthResponse instanceof Error || !saveAuthResponse.success) {
      await updateUnderdogFailedAuthAttempt(body.username);
      return response.status(500).send('error saving new token');
    }

    // reset failed auth attempt count if successful
    await resetUnderdogFailedAuthAttempt(body.username);

    // get updated user data
    const updatedUser: UserEntity | Error = await getUser(body.username).catch(
      (err: Error) => err
    );
    if (updatedUser instanceof Error) {
      return response.status(500).send(updatedUser.message);
    }

    return response.json(updatedUser);
  } catch (error) {
    return response.status(500).send(error);
  }
}
