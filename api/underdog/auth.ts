import { VercelRequest, VercelResponse } from '@vercel/node';

interface requestDto {
  username: string;
  password: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const requestBody: requestDto = request.body;

    const body = {
      audience: 'https://api.underdogfantasy.com',
      client_id: 'cQvYz1T2BAFbix4dYR37dyD9O0Thf1s6',
      grant_type: 'password',
      username: requestBody.username,
      password: requestBody.password,
      scope: 'offline_access',
    };

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(body),
    };

    const tokenResponse = await fetch(
      'https://login.underdogsports.com/oauth/token',
      requestOptions
    )
      .then((res) => res)
      .catch((err: Error) => err);

    console.log('auth tokenResponse:', tokenResponse);

    if (tokenResponse instanceof Error) {
      return response.status(500).send(tokenResponse);
    }

    return response.status(200).send(tokenResponse);
  } catch (error) {
    return response.status(500).json(error);
  }
}
