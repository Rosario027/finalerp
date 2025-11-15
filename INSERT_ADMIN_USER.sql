-- Insert Admin User with password "admin"
-- Copy and paste this into your database connector and run it

-- First, make sure pgcrypto extension is enabled (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert or update admin user
INSERT INTO users (username, password, role)
VALUES (
  'admin',
  '$2b$10$.3Dd5MtmHGMYnvfxyPvKHegWDd5S9Aa2BUDFqDkb4KoN/wz.a6in2',
  'admin'
)
ON CONFLICT (username) DO UPDATE
SET password = EXCLUDED.password,
    role = EXCLUDED.role;

-- Verify the user was created
SELECT id, username, role FROM users WHERE username = 'admin';

