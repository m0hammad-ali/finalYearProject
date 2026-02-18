/**
 * Inventory Routes
 * Vendor inventory management endpoints
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const inventorySchema = z.object({
  model_id: z.string().uuid(),
  unit_price: z.number().positive(),
  original_price: z.number().positive().optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  stock_quantity: z.number().int().min(0),
  condition_type: z.enum(['New', 'Open Box', 'Refurbished', 'Used - Like New', 'Used - Good', 'Used - Fair']),
  warranty_months: z.number().int().min(0).optional(),
  is_featured: z.boolean().optional(),
});

export const inventoryRoutes: FastifyPluginAsync = async (app) => {
  // Get all inventory (public view)
  app.get('/', async (request, reply) => {
    const {
      minPrice,
      maxPrice,
      condition,
      available,
      featured,
      limit = '50',
      offset = '0',
    } = request.query as Record<string, string>;

    const conditions: string[] = ['i.is_available = true'];
    const values: any[] = [];
    let paramIndex = 1;

    if (minPrice) {
      conditions.push(`i.unit_price >= $${paramIndex}`);
      values.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      conditions.push(`i.unit_price <= $${paramIndex}`);
      values.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (condition) {
      conditions.push(`i.condition_type = $${paramIndex}`);
      values.push(condition);
      paramIndex++;
    }

    if (available === 'true') {
      conditions.push('i.stock_quantity > 0');
    }

    if (featured === 'true') {
      conditions.push('i.is_featured = true');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        i.inventory_id,
        i.unit_price,
        i.original_price,
        i.discount_percentage,
        i.stock_quantity,
        i.condition_type,
        i.warranty_months,
        i.is_featured,
        i.listed_at,
        lm.model_id,
        lm.model_name,
        lm.series,
        b.brand_name,
        v.vendor_id,
        v.shop_name,
        v.shop_number
      FROM inventory i
      JOIN laptop_models lm ON i.model_id = lm.model_id
      JOIN brands b ON lm.brand_id = b.brand_id
      JOIN vendors v ON i.vendor_id = v.vendor_id
      ${whereClause}
      ORDER BY i.listed_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await app.db.query(query, values);

    return reply.send({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  });

  // Get inventory by ID
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await app.db.query(
      `
      SELECT 
        i.*,
        lm.model_name,
        lm.series,
        b.brand_name,
        v.shop_name,
        v.shop_number,
        v.plaza_name,
        v.contact_phone
      FROM inventory i
      JOIN laptop_models lm ON i.model_id = lm.model_id
      JOIN brands b ON lm.brand_id = b.brand_id
      JOIN vendors v ON i.vendor_id = v.vendor_id
      WHERE i.inventory_id = $1
    `,
      [id]
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'Inventory item not found',
      });
    }

    return reply.send({
      success: true,
      data: result.rows[0],
    });
  });

  // Get vendor's inventory (protected route - would require auth)
  app.get('/vendor/:vendorId', async (request, reply) => {
    const { vendorId } = request.params as { vendorId: string };

    const result = await app.db.query(
      `
      SELECT 
        i.*,
        lm.model_name,
        lm.series,
        b.brand_name
      FROM inventory i
      JOIN laptop_models lm ON i.model_id = lm.model_id
      JOIN brands b ON lm.brand_id = b.brand_id
      WHERE i.vendor_id = $1
      ORDER BY i.listed_at DESC
    `,
      [vendorId]
    );

    return reply.send({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  });

  // Create inventory item (protected route)
  app.post('/', async (request, reply) => {
    // In production, extract vendor_id from JWT token
    const body = inventorySchema.parse(request.body);
    const vendorId = 'vendor-uuid-from-jwt'; // Placeholder

    const result = await app.db.query(
      `INSERT INTO inventory (
        vendor_id, model_id, unit_price, original_price, 
        discount_percentage, stock_quantity, condition_type, 
        warranty_months, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        vendorId,
        body.model_id,
        body.unit_price,
        body.original_price || body.unit_price,
        body.discount_percentage || 0,
        body.stock_quantity,
        body.condition_type,
        body.warranty_months || 12,
        body.is_featured || false,
      ]
    );

    return reply.code(201).send({
      success: true,
      data: result.rows[0],
    });
  });

  // Update inventory
  app.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = inventorySchema.partial().parse(request.body);

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
      `UPDATE inventory SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE inventory_id = $${paramIndex}
       RETURNING *`,
      values
    );

    return reply.send({
      success: true,
      data: result.rows[0],
    });
  });

  // Delete inventory
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await app.db.query(
      'DELETE FROM inventory WHERE inventory_id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'Inventory item not found',
      });
    }

    return reply.send({
      success: true,
      message: 'Inventory item deleted successfully',
    });
  });

  // Update stock (atomic operation)
  app.patch('/:id/stock', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { quantity, operation } = request.body as { quantity: number; operation: 'add' | 'remove' | 'set' };

    let query: string;
    let values: any[];

    if (operation === 'set') {
      query = 'UPDATE inventory SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE inventory_id = $2 RETURNING *';
      values = [quantity, id];
    } else if (operation === 'add') {
      query = 'UPDATE inventory SET stock_quantity = stock_quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE inventory_id = $2 RETURNING *';
      values = [quantity, id];
    } else if (operation === 'remove') {
      query = 'UPDATE inventory SET stock_quantity = GREATEST(0, stock_quantity - $1), updated_at = CURRENT_TIMESTAMP WHERE inventory_id = $2 RETURNING *';
      values = [quantity, id];
    } else {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'Invalid operation. Use: add, remove, or set',
      });
    }

    const result = await app.db.query(query, values);

    return reply.send({
      success: true,
      data: result.rows[0],
    });
  });
};
