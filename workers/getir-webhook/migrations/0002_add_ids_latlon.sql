ALTER TABLE orders ADD COLUMN tenant_id TEXT;
ALTER TABLE orders ADD COLUMN platform_restaurant_id TEXT;
ALTER TABLE orders ADD COLUMN client_lat REAL;
ALTER TABLE orders ADD COLUMN client_lon REAL;
