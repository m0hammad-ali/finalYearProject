/**
 * Health Check Routes
 */

import { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (request, reply) => {
    try {
      // Check database connection
      await app.db.query('SELECT 1');
      const dbStatus = 'connected';
    } catch {
      return reply.code(503).send({
        status: 'unhealthy',
        service: 'api-gateway',
        version: '1.0.0',
        database: 'disconnected',
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

  app.get('/ready', async (request, reply) => {
    return reply.send({ ready: true });
  });

  app.get('/live', async (request, reply) => {
    return reply.send({ alive: true });
  });
};
