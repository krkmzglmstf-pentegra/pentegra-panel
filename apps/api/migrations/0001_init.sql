PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  disabled_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS tenant_members (
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','ops','restaurant','courier')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS restaurant_users (
  restaurant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (restaurant_id, user_id)
);

CREATE TABLE IF NOT EXISTS restaurant_integrations (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('getir','migros','yemeksepeti')),
  platform_restaurant_id TEXT NOT NULL,
  inbound_auth_ciphertext TEXT NULL,
  outbound_cred_ciphertext TEXT NULL,
  auto_approve INTEGER NOT NULL DEFAULT 0,
  auto_print INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (platform, platform_restaurant_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('getir','migros','yemeksepeti')),
  platform_order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  delivery_provider TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  raw_json TEXT NULL,
  UNIQUE (platform, platform_order_id)
);

CREATE TABLE IF NOT EXISTS order_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS webhook_receipts (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  received_at TEXT NOT NULL,
  raw_ref TEXT NULL,
  UNIQUE (platform, dedupe_key)
);

CREATE TABLE IF NOT EXISTS couriers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  auto_assign_enabled INTEGER NOT NULL DEFAULT 0,
  last_seen_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS courier_locations (
  id TEXT PRIMARY KEY,
  courier_id TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  accuracy_m REAL NULL,
  speed_mps REAL NULL,
  heading_deg REAL NULL,
  recorded_at TEXT NOT NULL,
  received_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  courier_id TEXT NOT NULL,
  status TEXT NOT NULL,
  assigned_at TEXT NOT NULL,
  accepted_at TEXT NULL,
  completed_at TEXT NULL
);

CREATE TABLE IF NOT EXISTS print_jobs (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  status TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant_restaurant_created_at
  ON orders (tenant_id, restaurant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_courier_locations
  ON courier_locations (courier_id, recorded_at);

CREATE INDEX IF NOT EXISTS idx_assignments_courier_status
  ON assignments (courier_id, status);

CREATE INDEX IF NOT EXISTS idx_restaurant_integrations
  ON restaurant_integrations (restaurant_id);
