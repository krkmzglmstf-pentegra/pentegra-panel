INSERT INTO tenants (id, name) VALUES ('9f9e0e9b-2a6d-4a8f-9a7d-8ce7d2c2f1a1', 'Demo Tenant');

INSERT INTO users (id, email, password_hash)
VALUES
  ('7a33b3c7-0ab5-4d5a-8b1f-2d1b8ad6c2f2', 'admin@demo.local', 'pbkdf2$100000$Csu61DFJZsq7I9pRhfk6DA==$8pdtSxN/GphSdO0HOkO27d8bqDxksukvwAMvbAZnhcQ='),
  ('2b4c3c1a-6fcb-4f75-9b9b-ef2f0c7f1f11', 'restoran@demo.local', 'pbkdf2$100000$KTqIYGxPk0OU6QOGePAoJw==$FTu7rjXDhed6+HvmVhdT0cOJ9gsY+PV0gMFQzP4iVpg='),
  ('8c9a1d5d-54b1-4f8d-bc1a-0f4f3dcb2a4a', 'pos@pentegra.com.tr', 'pbkdf2$100000$pcWAzCnvKGtg/Mr+Jm5tzQ==$NZFFinfqtTRs368q/gh7uPSu81IBDFyNk1ufuc2x0Bw=');

INSERT INTO tenant_members (tenant_id, user_id, role)
VALUES
  ('9f9e0e9b-2a6d-4a8f-9a7d-8ce7d2c2f1a1', '7a33b3c7-0ab5-4d5a-8b1f-2d1b8ad6c2f2', 'admin'),
  ('9f9e0e9b-2a6d-4a8f-9a7d-8ce7d2c2f1a1', '2b4c3c1a-6fcb-4f75-9b9b-ef2f0c7f1f11', 'restaurant'),
  ('9f9e0e9b-2a6d-4a8f-9a7d-8ce7d2c2f1a1', '8c9a1d5d-54b1-4f8d-bc1a-0f4f3dcb2a4a', 'admin');

INSERT INTO restaurants (id, tenant_id, name, address, lat, lon)
VALUES ('5f1b0d53-7b1a-4c0f-9b4d-6f4135e3a6f9', '9f9e0e9b-2a6d-4a8f-9a7d-8ce7d2c2f1a1', 'Demo Restoran', 'Demo Address', 41.015, 28.979);

INSERT INTO restaurant_users (restaurant_id, user_id)
VALUES ('5f1b0d53-7b1a-4c0f-9b4d-6f4135e3a6f9', '2b4c3c1a-6fcb-4f75-9b9b-ef2f0c7f1f11');
