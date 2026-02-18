/**
 * Laptops Routes
 * Laptop models and specifications endpoints
 */

import { FastifyPluginAsync } from 'fastify';

export const laptopsRoutes: FastifyPluginAsync = async (app) => {
  // Get all laptops with filters
  app.get('/', async (request, reply) => {
    const {
      brand,
      minRam,
      maxRam,
      minStorage,
      maxStorage,
      gpuType,
      minPrice,
      maxPrice,
      series,
      limit = '50',
      offset = '0',
    } = request.query as Record<string, string>;

    const conditions: string[] = ['lm.is_discontinued = false'];
    const values: any[] = [];
    let paramIndex = 1;

    if (brand) {
      conditions.push(`b.brand_slug = $${paramIndex}`);
      values.push(brand);
      paramIndex++;
    }

    if (minRam) {
      conditions.push(`hs.ram_gb >= $${paramIndex}`);
      values.push(parseInt(minRam, 10));
      paramIndex++;
    }

    if (maxRam) {
      conditions.push(`hs.ram_gb <= $${paramIndex}`);
      values.push(parseInt(maxRam, 10));
      paramIndex++;
    }

    if (minStorage) {
      conditions.push(`hs.storage_capacity_gb >= $${paramIndex}`);
      values.push(parseInt(minStorage, 10));
      paramIndex++;
    }

    if (maxStorage) {
      conditions.push(`hs.storage_capacity_gb <= $${paramIndex}`);
      values.push(parseInt(maxStorage, 10));
      paramIndex++;
    }

    if (gpuType) {
      conditions.push(`hs.gpu_type = $${paramIndex}`);
      values.push(gpuType);
      paramIndex++;
    }

    if (series) {
      conditions.push(`lm.series = $${paramIndex}`);
      values.push(series);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        lm.model_id,
        lm.model_name,
        lm.model_number,
        lm.series,
        lm.release_year,
        lm.short_description,
        lm.product_image_url,
        b.brand_id,
        b.brand_name,
        b.brand_slug,
        hs.processor_brand,
        hs.processor_model,
        hs.processor_cores,
        hs.ram_gb,
        hs.storage_type,
        hs.storage_capacity_gb,
        hs.gpu_type,
        hs.gpu_brand,
        hs.gpu_model,
        hs.display_size_inches,
        hs.display_resolution,
        hs.weight_kg,
        hs.battery_whr,
        MIN(i.unit_price) as min_price,
        MAX(i.unit_price) as max_price,
        COUNT(i.inventory_id) as available_count
      FROM laptop_models lm
      JOIN brands b ON lm.brand_id = b.brand_id
      JOIN hardware_specs hs ON lm.spec_id = hs.spec_id
      LEFT JOIN inventory i ON lm.model_id = i.model_id AND i.is_available = true AND i.stock_quantity > 0
      ${whereClause}
      GROUP BY lm.model_id, b.brand_id, hs.spec_id
      ORDER BY lm.model_name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await app.db.query(query, values);

    return reply.send({
      success: true,
      data: result.rows,
      count: result.rowCount,
      pagination: {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      },
    });
  });

  // Get laptop by ID
  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const result = await app.db.query(
      `
      SELECT 
        lm.*,
        b.brand_id,
        b.brand_name,
        b.brand_slug,
        b.official_website,
        hs.*
      FROM laptop_models lm
      JOIN brands b ON lm.brand_id = b.brand_id
      JOIN hardware_specs hs ON lm.spec_id = hs.spec_id
      WHERE lm.model_id = $1
    `,
      [id]
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({
        error: 'Not Found',
        message: 'Laptop model not found',
      });
    }

    // Get inventory for this laptop
    const inventoryResult = await app.db.query(
      `
      SELECT 
        i.*,
        v.shop_name,
        v.shop_number,
        v.plaza_name
      FROM inventory i
      JOIN vendors v ON i.vendor_id = v.vendor_id
      WHERE i.model_id = $1 AND i.is_available = true AND i.stock_quantity > 0
      ORDER BY i.unit_price ASC
    `,
      [id]
    );

    return reply.send({
      success: true,
      data: {
        ...result.rows[0],
        inventory: inventoryResult.rows,
      },
    });
  });

  // Search laptops
  app.get('/search/:query', async (request, reply) => {
    const { query } = request.params as { query: string };

    const result = await app.db.query(
      `
      SELECT 
        lm.model_id,
        lm.model_name,
        lm.series,
        b.brand_name,
        hs.processor_model,
        hs.ram_gb,
        hs.storage_capacity_gb,
        MIN(i.unit_price) as min_price
      FROM laptop_models lm
      JOIN brands b ON lm.brand_id = b.brand_id
      JOIN hardware_specs hs ON lm.spec_id = hs.spec_id
      LEFT JOIN inventory i ON lm.model_id = i.model_id AND i.is_available = true
      WHERE 
        lm.is_discontinued = false AND
        (
          lm.model_name ILIKE $1 OR
          lm.series ILIKE $1 OR
          b.brand_name ILIKE $1 OR
          hs.processor_model ILIKE $1
        )
      GROUP BY lm.model_id, b.brand_name, hs.processor_model, hs.ram_gb, hs.storage_capacity_gb
      LIMIT 20
    `,
      [`%${query}%`]
    );

    return reply.send({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  });
};
