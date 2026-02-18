/**
 * Database Connection Module
 * PostgreSQL connection pool with Fastify plugin
 */

import { FastifyPluginAsync } from "fastify";
import pg, { Pool, PoolConfig } from "pg";

const { Pool: PgPool } = pg;

declare module "fastify" {
  interface FastifyInstance {
    db: Pool;
  }
}

// Singleton pool instance exported for direct import
export let pool: Pool | null = null;

export const db: FastifyPluginAsync = async (app) => {
  const poolConfig: PoolConfig = {
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://gulhaji_admin:gulhaji_secure_pwd_change_in_prod@postgres:5432/gulhaji_marketplace",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  pool = new PgPool(poolConfig);

  // Test connection on startup
  try {
    await pool.query("SELECT NOW()");
    app.log.info("✅ Database connection established");
  } catch (error) {
    app.log.error("❌ Database connection failed:", error);
    throw error;
  }

  // Decorate fastify instance with db pool
  app.decorate("db", pool);

  // Close pool on app close
  app.addHook("onClose", async () => {
    if (pool) {
      await pool.end();
      app.log.info("Database pool closed");
      pool = null;
    }
  });
};

// Helper function to get pool
export function getPool(): Pool {
  if (!pool) {
    throw new Error("Database pool not initialized. Call app.register(db) first.");
  }
  return pool;
}

// Query helpers
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}
