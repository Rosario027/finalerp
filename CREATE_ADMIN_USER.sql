-- Create Admin User in Railway Database
-- Run this SQL script in your Railway PostgreSQL database using DB Code extension

-- First, make sure you have the pgcrypto extension enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert admin user (password: admin)
-- The password is hashed with bcrypt
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


