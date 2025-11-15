-- Quick Insert Admin User - Copy everything below and run in your database

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

INSERT INTO users (username, password, role)
VALUES ('admin', '$2b$10$.3Dd5MtmHGMYnvfxyPvKHegWDd5S9Aa2BUDFqDkb4KoN/wz.a6in2', 'admin')
ON CONFLICT (username) DO UPDATE
SET password = EXCLUDED.password, role = EXCLUDED.role;

SELECT id, username, role FROM users WHERE username = 'admin';

