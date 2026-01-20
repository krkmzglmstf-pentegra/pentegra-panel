export const runtime = "edge";

const API_ORIGIN = process.env.API_ORIGIN ?? "https://pentegra-api.krkmzglmstf.workers.dev";

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const targetUrl = new URL(url.pathname + url.search, API_ORIGIN);

  const headers = new Headers(request.headers);
  headers.delete("host");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual"
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  return fetch(targetUrl.toString(), init);
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
