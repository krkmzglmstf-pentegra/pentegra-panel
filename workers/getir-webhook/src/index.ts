export interface Env {
  DB: D1Database;
  GETIR_WEBHOOK_API_KEY?: string;
  GETIR_BASIC_USER?: string;
  GETIR_BASIC_PASS?: string;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function getHeader(request: Request, name: string): string | null {
  const value = request.headers.get(name);
  return value ? value.trim() : null;
}

function isAuthorized(request: Request, env: Env): boolean {
  const apiKey = env.GETIR_WEBHOOK_API_KEY;
  if (apiKey) {
    const headerKey = getHeader(request, "x-api-key");
    if (headerKey && headerKey === apiKey) return true;
  }

  const user = env.GETIR_BASIC_USER;
  const pass = env.GETIR_BASIC_PASS;
  if (user && pass) {
    const auth = getHeader(request, "authorization");
    if (auth && auth.toLowerCase().startsWith("basic ")) {
      const encoded = auth.slice(6).trim();
      const expected = btoa(`${user}:${pass}`);
      if (encoded === expected) return true;
    }
  }

  return false;
}

function pickFirst(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.length > 0) return value;
    if (typeof value === "number") return String(value);
  }
  return null;
}

function pickNestedId(payload: Record<string, unknown>, key: string): string | null {
  const nested = payload[key];
  if (!nested || typeof nested !== "object") return null;
  const value = (nested as Record<string, unknown>).id;
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

function pickNestedNumber(payload: Record<string, unknown>, key: string, nestedKey: string): number | null {
  const nested = payload[key];
  if (!nested || typeof nested !== "object") return null;
  const value = (nested as Record<string, unknown>)[nestedKey];
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseDeliveryType(payload: Record<string, unknown>): number | null {
  const value = payload.deliveryType ?? payload.delivery_type;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

async function handleNewOrder(request: Request, env: Env): Promise<Response> {
  if (!isAuthorized(request, env)) {
    return jsonResponse({ ok: false, error: "unauthorized" }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ ok: false, error: "invalid_json" }, 400);
  }

  const deliveryType = parseDeliveryType(payload);
  if (deliveryType !== null && deliveryType !== 2) {
    return jsonResponse({ ok: true, ignored: true, reason: "delivery_type_not_restaurant" });
  }

  const externalId =
    pickFirst(payload, ["foodOrderId", "orderId", "id", "food_order_id"]) ??
    crypto.randomUUID();

  const restaurantId =
    pickNestedId(payload, "restaurant") ??
    pickFirst(payload, ["restaurantId", "restaurant_id", "storeId", "store_id", "platformRestaurantId", "platform_restaurant_id"]) ??
    pickNestedId(payload, "store");
  const tenantId = pickFirst(payload, ["tenantId", "tenant_id", "companyId", "company_id"]);
  const platformRestaurantId =
    pickFirst(payload, ["platformRestaurantId", "platform_restaurant_id"]) ?? restaurantId;
  const clientLat = pickNestedNumber(payload, "client", "lat") ?? pickNestedNumber(payload, "location", "lat");
  const clientLon = pickNestedNumber(payload, "client", "lon") ?? pickNestedNumber(payload, "location", "lon");

  const now = new Date().toISOString();
  const payloadJson = JSON.stringify(payload);

  await env.DB.prepare(
    `INSERT INTO orders (platform, external_id, restaurant_id, tenant_id, platform_restaurant_id, client_lat, client_lon, delivery_type, status, payload_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(platform, external_id) DO UPDATE SET
       restaurant_id=excluded.restaurant_id,
       tenant_id=excluded.tenant_id,
       platform_restaurant_id=excluded.platform_restaurant_id,
       client_lat=excluded.client_lat,
       client_lon=excluded.client_lon,
       delivery_type=excluded.delivery_type,
       status=excluded.status,
       payload_json=excluded.payload_json`
  )
    .bind(
      "getir",
      externalId,
      restaurantId,
      tenantId,
      platformRestaurantId,
      clientLat,
      clientLon,
      deliveryType,
      "created",
      payloadJson,
      now
    )
    .run();

  return jsonResponse({ ok: true, externalId });
}

async function handleCancelOrder(request: Request, env: Env): Promise<Response> {
  if (!isAuthorized(request, env)) {
    return jsonResponse({ ok: false, error: "unauthorized" }, 401);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ ok: false, error: "invalid_json" }, 400);
  }

  const deliveryType = parseDeliveryType(payload);
  if (deliveryType !== null && deliveryType !== 2) {
    return jsonResponse({ ok: true, ignored: true, reason: "delivery_type_not_restaurant" });
  }

  const externalId =
    pickFirst(payload, ["foodOrderId", "orderId", "id", "food_order_id"]) ??
    crypto.randomUUID();

  const restaurantId =
    pickNestedId(payload, "restaurant") ??
    pickFirst(payload, ["restaurantId", "restaurant_id", "storeId", "store_id", "platformRestaurantId", "platform_restaurant_id"]) ??
    pickNestedId(payload, "store");
  const tenantId = pickFirst(payload, ["tenantId", "tenant_id", "companyId", "company_id"]);
  const platformRestaurantId =
    pickFirst(payload, ["platformRestaurantId", "platform_restaurant_id"]) ?? restaurantId;
  const clientLat = pickNestedNumber(payload, "client", "lat") ?? pickNestedNumber(payload, "location", "lat");
  const clientLon = pickNestedNumber(payload, "client", "lon") ?? pickNestedNumber(payload, "location", "lon");
  const now = new Date().toISOString();
  const payloadJson = JSON.stringify(payload);

  await env.DB.prepare(
    `INSERT INTO orders (platform, external_id, restaurant_id, tenant_id, platform_restaurant_id, client_lat, client_lon, delivery_type, status, payload_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(platform, external_id) DO UPDATE SET
       restaurant_id=excluded.restaurant_id,
       tenant_id=excluded.tenant_id,
       platform_restaurant_id=excluded.platform_restaurant_id,
       client_lat=excluded.client_lat,
       client_lon=excluded.client_lon,
       delivery_type=excluded.delivery_type,
       status=excluded.status,
       payload_json=excluded.payload_json`
  )
    .bind(
      "getir",
      externalId,
      restaurantId,
      tenantId,
      platformRestaurantId,
      clientLat,
      clientLon,
      deliveryType,
      "canceled",
      payloadJson,
      now
    )
    .run();

  return jsonResponse({ ok: true, externalId });
}

type OrderRow = {
  external_id: string;
  restaurant_id: string | null;
  tenant_id: string | null;
  platform_restaurant_id: string | null;
  client_lat: number | null;
  client_lon: number | null;
  delivery_type: number | null;
  status: string;
  created_at: string;
};

function mapStatus(status: string): string {
  if (status === "created") return "RECEIVED";
  if (status === "canceled") return "CANCELED";
  return status.toUpperCase();
}

async function handleGetOrders(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const restaurantId = url.searchParams.get("restaurantId");

  let query =
    "SELECT external_id, restaurant_id, tenant_id, platform_restaurant_id, client_lat, client_lon, delivery_type, status, created_at FROM orders WHERE platform = ?";
  const binds: unknown[] = ["getir"];

  if (restaurantId) {
    query += " AND restaurant_id = ?";
    binds.push(restaurantId);
  }

  query += " ORDER BY datetime(created_at) DESC LIMIT 200";

  const result = await env.DB.prepare(query).bind(...binds).all<OrderRow>();
  const rows = (result.results ?? []).map((row) => ({
    id: row.external_id,
    restaurant_id: row.restaurant_id,
    tenant_id: row.tenant_id,
    platform_restaurant_id: row.platform_restaurant_id,
    client_location: row.client_lat === null || row.client_lon === null ? null : { lat: row.client_lat, lon: row.client_lon },
    platform: "getir",
    status: mapStatus(row.status),
    created_at: row.created_at,
    delivery_provider: row.delivery_type === 2 ? "RESTAURANT" : "GETIR"
  }));

  return jsonResponse({ ok: true, data: rows });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "GET" && path.endsWith("/api/getir/orders")) {
      return handleGetOrders(request, env);
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
    }

    if (path.endsWith("/api/getir/newOrder")) {
      return handleNewOrder(request, env);
    }

    if (path.endsWith("/api/getir/cancelOrder")) {
      return handleCancelOrder(request, env);
    }

    return jsonResponse({ ok: false, error: "not_found" }, 404);
  },
};
