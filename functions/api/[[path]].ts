export async function onRequest({ request, env }: { request: Request; env: { API_ORIGIN?: string } }) {
  const origin = env.API_ORIGIN ?? 'https://pentegra-api.krkmzglmstf.workers.dev';
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const targetUrl = new URL(path + url.search, origin);

  const headers = new Headers(request.headers);
  headers.delete('host');

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual'
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  return fetch(targetUrl.toString(), init);
}