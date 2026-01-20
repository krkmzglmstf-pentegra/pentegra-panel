INSERT INTO tenants (id, name) VALUES ('9f9e0e9b-2a6d-4a8f-9a7d-8ce7d2c2f1a1', 'Demo Tenant');

INSERT INTO users (id, email, password_hash)
VALUES
  ('7a33b3c7-0ab5-4d5a-8b1f-2d1b8ad6c2f2', 'admin@demo.local', 'pbkdf2$120000$BMV5hq1zsKzqzgKKBBUBVA==$GbRlN+1mnnxztzz4NEV79cdd6Y2rc/wB6ODoHcXcfqA='),
  ('2b4c3c1a-6fcb-4f75-9b9b-ef2f0c7f1f11', 'restoran@demo.local', 'pbkdf2$120000$tImzMY19bFylCAmufHkRoQ==$OhdWMheZibqDs7U9ydxwyhc6z0ogDF4EYVLaxetLL28=');

INSERT INTO tenant_members (tenant_id, user_id, role)
VALUES
  ('9f9e0e9b-2a6d-4a8f-9a7d-8ce7d2c2f1a1', '7a33b3c7-0ab5-4d5a-8b1f-2d1b8ad6c2f2', 'admin'),
  ('9f9e0e9b-2a6d-4a8f-9a7d-8ce7d2c2f1a1', '2b4c3c1a-6fcb-4f75-9b9b-ef2f0c7f1f11', 'restaurant');

INSERT INTO restaurants (id, tenant_id, name, address, lat, lon)
VALUES ('5f1b0d53-7b1a-4c0f-9b4d-6f4135e3a6f9', '9f9e0e9b-2a6d-4a8f-9a7d-8ce7d2c2f1a1', 'Demo Restoran', 'Demo Address', 41.015, 28.979);

INSERT INTO restaurant_users (restaurant_id, user_id)
VALUES ('5f1b0d53-7b1a-4c0f-9b4d-6f4135e3a6f9', '2b4c3c1a-6fcb-4f75-9b9b-ef2f0c7f1f11');
