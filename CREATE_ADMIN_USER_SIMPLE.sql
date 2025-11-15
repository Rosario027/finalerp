-- Create Admin User in Database
-- Run this SQL script in your database using DB Code extension or Railway Query tab
-- 
-- This creates an admin user with:
-- Username: admin
-- Password: admin
-- Role: admin

-- Make sure the users table exists first (run database_schema.sql if needed)
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert admin user with password "admin" (bcrypt hashed)
-- The password hash below is for the password: "admin"
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

