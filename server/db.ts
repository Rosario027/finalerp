import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
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

// Test database connection on startup
(async () => {
  try {
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connection test successful");
  } catch (err) {
    console.error("❌ Database connection test failed:", err);
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
    console.error("DATABASE_URL:", maskedUrl);
  }
})();
