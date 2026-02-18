/**
 * API Gateway - Gulhaji Plaza Laptop Recommendation System
 * 
 * Handles I/O operations, routing, and service orchestration.
 * AI compute-heavy logic is delegated to the ai-compute service.
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

import { healthRoutes } from './routes/health';
import { brandsRoutes } from './routes/brands';
import { laptopsRoutes } from './routes/laptops';
import { inventoryRoutes } from './routes/inventory';
import { usersRoutes } from './routes/users';
import { recommendationsRoutes } from './routes/recommendations';
import { db } from './db';

const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Register plugins
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: false, // Configure for production
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // API Documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Gulhaji Plaza API Gateway',
        description: 'API Gateway for Laptop Recommendation and Marketplace',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Database connection
  await app.register(db);

  // Register routes
  await app.register(healthRoutes, { prefix: '/health' });
  await app.register(brandsRoutes, { prefix: '/api/v1/brands' });
  await app.register(laptopsRoutes, { prefix: '/api/v1/laptops' });
  await app.register(inventoryRoutes, { prefix: '/api/v1/inventory' });
  await app.register(usersRoutes, { prefix: '/api/v1/users' });
  await app.register(recommendationsRoutes, { prefix: '/api/v1/recommendations' });

  // 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      statusCode: 404,
    });
  });

  // Error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    reply.code(error.statusCode || 500).send({
      error: error.name,
      message: error.message,
      statusCode: error.statusCode || 500,
    });
  });

  return app;
};

const start = async () => {
  const app = await buildApp();

  const host = process.env.HOST || '0.0.0.0';
  const port = parseInt(process.env.PORT || '3000', 10);

  try {
    await app.listen({ port, host });
    console.log(`🚀 API Gateway running at http://${host}:${port}`);
    console.log(`📚 API Documentation at http://${host}:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

start();
