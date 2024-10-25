import { VercelRequest, VercelResponse } from '@vercel/node';

interface requestDto {
  refreshToken: string;
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
      grant_type: 'refresh_token',
      refresh_token: requestBody.refreshToken,
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
      .then((res) => res.json() as any)
      .catch((err: Error) => err);

    if (tokenResponse instanceof Error) {
      return response.status(500).json(tokenResponse);
    }
    if ('error' in tokenResponse) {
      return response
        .status(500)
        .json(`${tokenResponse.error} | ${tokenResponse.error_description}`);
    }

    return response.status(200).json(tokenResponse);
  } catch (error) {
    return response.status(500).json(error);
  }
}
