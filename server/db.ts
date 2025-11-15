import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure pool with connection limits and timeout
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of connections in the pool
  connectionTimeoutMillis: 10000, // 10 second connection timeout
  idleTimeoutMillis: 30000, // 30 seconds before closing idle connections
});

export const db = drizzle({ client: pool, schema });

// Note: Connection test removed to prevent crashes with Neon driver + Node.js 22
// The first actual query will test the connection anyway
// If you see connection errors, check your DATABASE_URL environment variable
