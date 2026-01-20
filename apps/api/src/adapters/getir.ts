import type { Env } from '../types';

export async function getirApproveOrder(
  env: Env,
  integrationId: string,
  orderId: string
): Promise<Response> {
  const token = await getToken(env, integrationId);
  const url = `https://api.getir.example.com/orders/${orderId}/approve`;
  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

async function getToken(env: Env, integrationId: string): Promise<string> {
  const id = env.TOKEN_BROKER.idFromName(integrationId);
  const stub = env.TOKEN_BROKER.get(id);
  const response = await stub.fetch('https://token-broker/token', {
    method: 'POST',
    body: JSON.stringify({ integrationId })
  });
  if (!response.ok) {
    throw new Error('token broker error');
  }
  const data = (await response.json()) as { token: string };
  return data.token;
}
