/**
 * Health Check Routes
 */

import { FastifyPluginAsync } from 'fastify';
import { getPool } from '../db';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (_request, reply) => {
    try {
      // Check database connection using singleton pool
      const db = getPool();
      const result = await db.query('SELECT 1');
      app.log.info('Database health check passed', { rowCount: result.rowCount });
    } catch (error: any) {
      app.log.error('Database health check failed', { error: error.message });
      return reply.code(503).send({
        status: 'unhealthy',
        service: 'api-gateway',
        version: '1.0.0',
        database: 'disconnected',
        error: error.message,
      });
    }

    return reply.send({
      status: 'healthy',
      service: 'api-gateway',
      version: '1.0.0',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/ready', async (_request, reply) => {
    return reply.send({ ready: true });
  });

  app.get('/live', async (_request, reply) => {
    return reply.send({ alive: true });
  });
};
