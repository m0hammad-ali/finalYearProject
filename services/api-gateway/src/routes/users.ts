/**
 * Users Routes
 * User authentication and profile management
 */

import { FastifyPluginAsync } from 'fastify';
import { getPool } from '../db';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone_number: z.string().optional(),
  user_type: z.enum(['customer', 'vendor']).default('customer'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const usersRoutes: FastifyPluginAsync = async (app) => {
  // Register new user
  app.post('/register', async (request, reply) => {
    const db = getPool();
    const body = registerSchema.parse(request.body);

    // Check if email already exists
    const existingUser = await db.query(
      'SELECT user_id FROM users WHERE email = $1',
      [body.email]
    );

    if (existingUser.rowCount > 0) {
      return reply.code(409).send({
        error: 'Conflict',
        message: 'Email already registered',
      });
    }

    // Hash password (in production, use bcrypt)
    const passwordHash = body.password; // Placeholder - use bcrypt in production

    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone_number, user_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, email, first_name, last_name, user_type, created_at`,
      [body.email, passwordHash, body.first_name, body.last_name, body.phone_number, body.user_type]
    );

    // Create vendor record if user_type is vendor
    if (body.user_type === 'vendor') {
      await db.query(
        `INSERT INTO vendors (user_id, shop_name, is_active)
         VALUES ($1, $2, false)`,
        [result.rows[0].user_id, 'Pending Setup']
      );
    }

    return reply.code(201).send({
      success: true,
      data: result.rows[0],
      message: 'User registered successfully',
    });
  });

  // Login
  app.post('/login', async (request, reply) => {
    const db = getPool();
    const body = loginSchema.parse(request.body);

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [body.email]
    );

    if (result.rowCount === 0) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // Verify password (in production, use bcrypt.compare)
    if (user.password_hash !== body.password) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Generate JWT token (in production, use @fastify/jwt)
    const token = 'jwt-token-placeholder'; // Placeholder - use JWT in production

    return reply.send({
      success: true,
      data: {
        user: {
          user_id: user.user_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
        },
        token,
      },
    });
  });

  // Get current user profile (protected route)
  app.get('/me', async (request, reply) => {
    const db = getPool();
    // In production, extract user_id from JWT token
    const userId = 'user-uuid-from-jwt'; // Placeholder

    const result = await db.query(
      `SELECT user_id, email, first_name, last_name, phone_number, user_type, 
              is_verified, created_at, last_login_at
       FROM users
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    return reply.send({
      success: true,
      data: result.rows[0],
    });
  });

  // Update user profile
  app.put('/me', async (request, reply) => {
    const db = getPool();
    const userId = 'user-uuid-from-jwt'; // Placeholder
    const { first_name, last_name, phone_number } = request.body as Record<string, string>;

    const result = await db.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone_number = COALESCE($3, phone_number),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4
       RETURNING user_id, email, first_name, last_name, phone_number, user_type`,
      [first_name, last_name, phone_number, userId]
    );

    return reply.send({
      success: true,
      data: result.rows[0],
    });
  });

  // Get user preferences
  app.get('/me/preferences', async (request, reply) => {
    const db = getPool();
    const userId = 'user-uuid-from-jwt'; // Placeholder

    const result = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    return reply.send({
      success: true,
      data: result.rows[0] || null,
    });
  });

  // Update user preferences
  app.put('/me/preferences', async (request, reply) => {
    const db = getPool();
    const userId = 'user-uuid-from-jwt'; // Placeholder
    const prefs = request.body as Record<string, any>;

    // Check if preferences exist
    const existing = await db.query(
      'SELECT preference_id FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    let result;
    if (existing.rowCount === 0) {
      result = await db.query(
        `INSERT INTO user_preferences (user_id, min_budget, max_budget, primary_usage, min_ram_gb, min_storage_gb)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [userId, prefs.min_budget, prefs.max_budget, prefs.primary_usage, prefs.min_ram_gb, prefs.min_storage_gb]
      );
    } else {
      result = await db.query(
        `UPDATE user_preferences 
         SET min_budget = COALESCE($1, min_budget),
             max_budget = COALESCE($2, max_budget),
             primary_usage = COALESCE($3, primary_usage),
             min_ram_gb = COALESCE($4, min_ram_gb),
             min_storage_gb = COALESCE($5, min_storage_gb),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $6
         RETURNING *`,
        [prefs.min_budget, prefs.max_budget, prefs.primary_usage, prefs.min_ram_gb, prefs.min_storage_gb, userId]
      );
    }

    return reply.send({
      success: true,
      data: result.rows[0],
    });
  });
};
