/**
 * Database Connection Module
 * PostgreSQL connection pool with Fastify plugin
 */

import { FastifyPluginAsync } from 'fastify';
import pg, { Pool, PoolConfig } from 'pg';

const { Pool: PgPool } = pg;

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool;
  }
}

export const db: FastifyPluginAsync = async (app) => {
  const poolConfig: PoolConfig = {
    connectionString: process.env.DATABASE_URL || 'postgresql://gulhaji_admin:secure_password_123@postgres:5432/gulhaji_marketplace',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  const pool = new PgPool(poolConfig);

  // Test connection on startup
  try {
    await pool.query('SELECT NOW()');
    app.log.info('✅ Database connection established');
  } catch (error) {
    app.log.error('❌ Database connection failed:', error);
    throw error;
  }

  // Decorate fastify instance with db pool
  app.decorate('db', pool);

  // Close pool on app close
  app.addHook('onClose', async () => {
    await pool.end();
    app.log.info('Database pool closed');
  });
};

// Query helpers
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export async function query<T = any>(
  pool: Pool,
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const result = await pool.query<T>(text, params);
  const duration = Date.now() - start;
  
  console.log('Executed query', { text, duration, rows: result.rowCount });
  
  return {
    rows: result.rows,
    rowCount: result.rowCount,
  };
}
