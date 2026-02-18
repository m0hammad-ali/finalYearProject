/**
 * Brands Routes
 * CRUD operations for laptop brands
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const brandSchema = z.object({
  brand_name: z.string().min(1).max(100),
  brand_slug: z.string().regex(/^[a-z0-9-]+$/),
  country_of_origin: z.string().max(100).optional(),
  official_website: z.string().url().optional(),
  is_active: z.boolean().optional(),
});

export const brandsRoutes: FastifyPluginAsync = async (app) => {
  // Get all brands
  app.get('/', async (request, reply) => {
    const result = await app.db.query(`
      SELECT * FROM brands 
      WHERE is_active = true 
      ORDER BY brand_name
    `);
    
    return reply.send({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  });

  // Get brand by ID
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const result = await app.db.query(
      'SELECT * FROM brands WHERE brand_id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'Brand not found',
      });
    }
    
    return reply.send({
      success: true,
      data: result.rows[0],
    });
  });

  // Create brand
  app.post('/', async (request, reply) => {
    const body = brandSchema.parse(request.body);
    
    const result = await app.db.query(
      `INSERT INTO brands (brand_name, brand_slug, country_of_origin, official_website)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [body.brand_name, body.brand_slug, body.country_of_origin, body.official_website]
    );
    
    return reply.code(201).send({
      success: true,
      data: result.rows[0],
    });
  });

  // Update brand
  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = brandSchema.partial().parse(request.body);
    
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }
    
    if (fields.length === 0) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'No fields to update',
      });
    }
    
    values.push(id);
    
    const result = await app.db.query(
      `UPDATE brands SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE brand_id = $${paramIndex}
       RETURNING *`,
      values
    );
    
    return reply.send({
      success: true,
      data: result.rows[0],
    });
  });

  // Delete brand
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const result = await app.db.query(
      'DELETE FROM brands WHERE brand_id = $1 RETURNING *',
      [id]
    );
    
    if (result.rowCount === 0) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'Brand not found',
      });
    }
    
    return reply.send({
      success: true,
      message: 'Brand deleted successfully',
    });
  });
};
