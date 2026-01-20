import type { DurableObjectState } from '@cloudflare/workers-types';
import type { Env } from '../types';
import { getOutboundCreds } from '../services/integrations';

type TokenCache = { token: string; expiresAt: number };

export class TokenBroker {
  private state: DurableObjectState;
  private env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('method not allowed', { status: 405 });
    }
    const body = (await request.json()) as { integrationId: string };
    const cached = await this.state.storage.get<TokenCache>('token');
    const now = Date.now();
    if (cached && cached.expiresAt > now + 30_000) {
      return Response.json({ token: cached.token });
    }

    const integration = await this.env.DB.prepare('SELECT * FROM restaurant_integrations WHERE id = ?')
      .bind(body.integrationId)
      .first();
    if (!integration) {
      return new Response('integration not found', { status: 404 });
    }

    const outbound = await getOutboundCreds(this.env, integration as any);
    if (!outbound) {
      return new Response('missing outbound credentials', { status: 400 });
    }

    const staticToken = outbound.access_token as string | undefined;
    const staticExpiry = outbound.expires_at as number | undefined;
    if (staticToken) {
      await this.state.storage.put<TokenCache>('token', {
        token: staticToken,
        expiresAt: staticExpiry ?? now + 3600_000
      });
      return Response.json({ token: staticToken });
    }

    const tokenUrl = outbound.token_url as string | undefined;
    const clientId = outbound.client_id as string | undefined;
    const clientSecret = outbound.client_secret as string | undefined;
    if (!tokenUrl || !clientId || !clientSecret) {
      return new Response('missing token config', { status: 400 });
    }

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    if (!response.ok) {
      return new Response('token fetch failed', { status: 502 });
    }

    const payload = (await response.json()) as { access_token: string; expires_in?: number };
    const expiresAt = now + (payload.expires_in ?? 3600) * 1000;
    await this.state.storage.put<TokenCache>('token', { token: payload.access_token, expiresAt });
    return Response.json({ token: payload.access_token });
  }
}
