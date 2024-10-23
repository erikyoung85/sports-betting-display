import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify(request.body);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
    };

    const tokenResponse = await fetch(
      'https://login.underdogsports.com/oauth/token',
      requestOptions
    ).then((res) => res.json());

    return response.status(200).json(tokenResponse);
  } catch (error) {
    return response.status(500).json(error);
  }
}
