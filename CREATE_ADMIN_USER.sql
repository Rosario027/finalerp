-- Create Admin User in Railway Database
-- Run this SQL script in your Railway PostgreSQL database using DB Code extension

-- First, make sure you have the pgcrypto extension enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert admin user (password: admin@2025)
-- The password is hashed with bcrypt
INSERT INTO users (id, username, password, role)
VALUES (
  gen_random_uuid(),
  'admin',
  '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
  'admin'
)
ON CONFLICT (username) DO NOTHING;

-- Note: The password hash above is a placeholder
-- You need to generate a proper bcrypt hash for "admin@2025"
-- Or use the seed script: npm run seed


