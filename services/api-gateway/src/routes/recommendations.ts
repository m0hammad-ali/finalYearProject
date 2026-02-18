/**
 * Recommendations Routes
 * AI-powered laptop recommendations
 *
 * This route integrates with the ai-compute service for ML processing.
 * The API gateway handles I/O and orchestration while ai-compute handles
 * the heavy computation (Min-Max normalization, similarity scoring, etc.)
 */

import { FastifyPluginAsync } from 'fastify';
import { getPool } from '../db';
import { z } from 'zod';

const recommendationSchema = z.object({
  user_preferences: z.object({
    min_budget: z.number().optional(),
    max_budget: z.number().optional(),
    primary_usage: z.enum(['Gaming', 'Programming', 'Design', 'Video Editing', 'Office', 'Student', 'General', 'Workstation']),
    min_ram_gb: z.number().optional(),
    min_storage_gb: z.number().optional(),
    preferred_gpu_type: z.enum(['Integrated', 'Dedicated', 'Hybrid']).optional(),
    min_display_size: z.number().optional(),
    max_weight_kg: z.number().optional(),
    prefer_thin_and_light: z.boolean().optional(),
  }),
  top_k: z.number().int().min(1).max(20).default(5),
});

// AI Compute Service URL
const AI_COMPUTE_URL = process.env.AI_COMPUTE_URL || 'http://ai-compute:8000';

export const recommendationsRoutes: FastifyPluginAsync = async (app) => {
  // Get personalized recommendations
  app.post('/', async (request, reply) => {
    const db = getPool();
    const body = recommendationSchema.parse(request.body);
    const userId = 'user-uuid-from-jwt'; // Placeholder - extract from JWT

    try {
      // Call AI compute service for recommendations
      const aiResponse = await fetch(`${AI_COMPUTE_URL}/api/v1/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI service error: ${aiResponse.statusText}`);
      }

      const aiData = await aiResponse.json();

      // Enrich recommendations with laptop details from database
      const enrichedRecommendations = await Promise.all(
        aiData.recommendations.map(async (rec: any) => {
          const laptopResult = await db.query(
            `
            SELECT
              lm.model_id,
              lm.model_name,
              lm.series,
              lm.short_description,
              lm.product_image_url,
              b.brand_name,
              b.brand_slug,
              hs.processor_model,
              hs.ram_gb,
              hs.storage_capacity_gb,
              hs.gpu_model,
              hs.display_size_inches,
              MIN(i.unit_price) as min_price,
              COUNT(i.inventory_id) as available_from
            FROM laptop_models lm
            JOIN brands b ON lm.brand_id = b.brand_id
            JOIN hardware_specs hs ON lm.spec_id = hs.spec_id
            LEFT JOIN inventory i ON lm.model_id = i.model_id AND i.is_available = true
            WHERE lm.model_id = $1
            GROUP BY lm.model_id, b.brand_name, hs.processor_model, hs.ram_gb,
                     hs.storage_capacity_gb, hs.gpu_model, hs.display_size_inches
          `,
            [rec.spec_id]
          );

          return {
            ...rec,
            laptop: laptopResult.rows[0] || null,
          };
        })
      );

      // Store recommendation in database for analytics
      await Promise.all(
        enrichedRecommendations.map((rec: any) =>
          db.query(
            `INSERT INTO recommendations (
              user_id, model_id, relevance_score, confidence_score,
              recommendation_reason, matched_features
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              userId,
              rec.laptop?.model_id,
              rec.relevance_score,
              aiData.confidence || null,
              generateRecommendationReason(rec, body.user_preferences),
              JSON.stringify(rec.matched_features || []),
            ]
          ).catch(() => app.log.warn('Failed to store recommendation')) // Log errors for analytics
        )
      );

      return reply.send({
        success: true,
        data: {
          recommendations: enrichedRecommendations,
          user_preferences: body.user_preferences,
          generated_at: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      app.log.error('Recommendation error:', error);

      // Fallback to database-based recommendations
      const fallbackRecs = await getFallbackRecommendations(app, body);

      return reply.send({
        success: true,
        data: {
          recommendations: fallbackRecs,
          user_preferences: body.user_preferences,
          generated_at: new Date().toISOString(),
          note: 'Fallback recommendations (AI service unavailable)',
        },
      });
    }
  });

  // Get trending laptops
  app.get('/trending', async (request, reply) => {
    const db = getPool();
    const result = await db.query(
      `
      SELECT 
        lm.model_id,
        lm.model_name,
        lm.series,
        b.brand_name,
        hs.ram_gb,
        hs.storage_capacity_gb,
        hs.gpu_type,
        MIN(i.unit_price) as min_price,
        COUNT(r.recommendation_id) as recommendation_count
      FROM laptop_models lm
      JOIN brands b ON lm.brand_id = b.brand_id
      JOIN hardware_specs hs ON lm.spec_id = hs.spec_id
      LEFT JOIN inventory i ON lm.model_id = i.model_id AND i.is_available = true
      LEFT JOIN recommendations r ON lm.model_id = r.model_id 
        AND r.created_at > NOW() - INTERVAL '7 days'
      WHERE lm.is_discontinued = false
      GROUP BY lm.model_id, b.brand_name, hs.ram_gb, hs.storage_capacity_gb, hs.gpu_type
      ORDER BY recommendation_count DESC, min_price ASC
      LIMIT 10
    `
    );

    return reply.send({
      success: true,
      data: result.rows,
    });
  });

  // Get recommendations by usage type
  app.get('/by-usage/:usage', async (request, reply) => {
    const db = getPool();
    const { usage } = request.params as { usage: string };
    const limit = parseInt((request.query as any).limit) || 10;

    // Map usage to hardware priorities
    const usageSpecs: Record<string, Partial<any>> = {
      gaming: { min_gpu_score: 5, min_ram_gb: 16, min_refresh_rate: 120 },
      programming: { min_ram_gb: 16, min_cores: 6 },
      design: { min_display_quality: 6, min_ram_gb: 16 },
      'video editing': { min_ram_gb: 32, min_cores: 8 },
      office: { max_weight_kg: 2, min_battery: 60 },
      student: { max_price: 150000, min_ram_gb: 8 },
    };

    const specs = usageSpecs[usage.toLowerCase()] || {};

    const conditions: string[] = ['lm.is_discontinued = false'];
    const values: any[] = [];
    let paramIndex = 1;

    if (specs.min_ram_gb) {
      conditions.push(`hs.ram_gb >= $${paramIndex}`);
      values.push(specs.min_ram_gb);
      paramIndex++;
    }

    if (specs.min_cores) {
      conditions.push(`hs.processor_cores >= $${paramIndex}`);
      values.push(specs.min_cores);
      paramIndex++;
    }

    if (specs.min_refresh_rate) {
      conditions.push(`hs.refresh_rate_hz >= $${paramIndex}`);
      values.push(specs.min_refresh_rate);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        lm.model_id,
        lm.model_name,
        lm.series,
        b.brand_name,
        hs.processor_model,
        hs.processor_cores,
        hs.ram_gb,
        hs.storage_capacity_gb,
        hs.gpu_type,
        hs.gpu_model,
        hs.display_size_inches,
        hs.refresh_rate_hz,
        hs.weight_kg,
        MIN(i.unit_price) as min_price
      FROM laptop_models lm
      JOIN brands b ON lm.brand_id = b.brand_id
      JOIN hardware_specs hs ON lm.spec_id = hs.spec_id
      LEFT JOIN inventory i ON lm.model_id = i.model_id AND i.is_available = true
      ${whereClause}
      GROUP BY lm.model_id, b.brand_name, hs.spec_id
      ORDER BY min_price ASC
      LIMIT $${paramIndex}
    `;

    values.push(limit);

    const result = await db.query(query, values);

    return reply.send({
      success: true,
      data: result.rows,
      usage_type: usage,
    });
  });

  // Compare laptops
  app.post('/compare', async (request, reply) => {
    const db = getPool();
    const { model_ids } = request.body as { model_ids: string[] };

    if (!model_ids || model_ids.length === 0 || model_ids.length > 4) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'Provide 1-4 model IDs to compare',
      });
    }

    const placeholders = model_ids.map((_, i) => `$${i + 1}`).join(',');

    const result = await db.query(
      `
      SELECT 
        lm.model_id,
        lm.model_name,
        lm.series,
        b.brand_name,
        hs.*,
        MIN(i.unit_price) as min_price
      FROM laptop_models lm
      JOIN brands b ON lm.brand_id = b.brand_id
      JOIN hardware_specs hs ON lm.spec_id = hs.spec_id
      LEFT JOIN inventory i ON lm.model_id = i.model_id AND i.is_available = true
      WHERE lm.model_id IN (${placeholders})
      GROUP BY lm.model_id, b.brand_name, hs.spec_id
    `,
      model_ids
    );

    return reply.send({
      success: true,
      data: result.rows,
      count: result.rowCount,
    });
  });
};

/**
 * Generate human-readable recommendation reason
 */
function generateRecommendationReason(
  recommendation: any,
  preferences: any
): string {
  const reasons: string[] = [];

  if (preferences.primary_usage === 'Gaming' && recommendation.laptop?.gpu_type === 'Dedicated') {
    reasons.push('Dedicated GPU for gaming performance');
  }

  if (recommendation.laptop?.ram_gb >= 16) {
    reasons.push(`${recommendation.laptop.ram_gb}GB RAM for smooth multitasking`);
  }

  if (preferences.prefer_thin_and_light && recommendation.laptop) {
    reasons.push('Portable design for on-the-go use');
  }

  if (preferences.max_budget && recommendation.laptop?.min_price) {
    if (recommendation.laptop.min_price <= preferences.max_budget) {
      reasons.push('Within your budget');
    }
  }

  return reasons.length > 0 ? reasons.join(', ') : 'Matches your preferences';
}

/**
 * Fallback recommendations when AI service is unavailable
 */
async function getFallbackRecommendations(
  app: any,
  body: any
): Promise<any[]> {
  const prefs = body.user_preferences;
  const conditions: string[] = ['lm.is_discontinued = false', 'i.is_available = true', 'i.stock_quantity > 0'];
  const values: any[] = [];
  let paramIndex = 1;

  if (prefs.max_budget) {
    conditions.push(`i.unit_price <= $${paramIndex}`);
    values.push(prefs.max_budget);
    paramIndex++;
  }

  if (prefs.min_ram_gb) {
    conditions.push(`hs.ram_gb >= $${paramIndex}`);
    values.push(prefs.min_ram_gb);
    paramIndex++;
  }

  if (prefs.preferred_gpu_type) {
    conditions.push(`hs.gpu_type = $${paramIndex}`);
    values.push(prefs.preferred_gpu_type);
    paramIndex++;
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const query = `
    SELECT 
      lm.model_id as spec_id,
      lm.model_name,
      lm.series,
      b.brand_name,
      hs.ram_gb,
      hs.storage_capacity_gb,
      hs.gpu_type,
      i.unit_price as min_price,
      0.5 as relevance_score
    FROM laptop_models lm
    JOIN brands b ON lm.brand_id = b.brand_id
    JOIN hardware_specs hs ON lm.spec_id = hs.spec_id
    JOIN inventory i ON lm.model_id = i.model_id
    ${whereClause}
    ORDER BY i.unit_price ASC
    LIMIT $${paramIndex}
  `;

  values.push(body.top_k);

  const result = await db.query(query, values);

  return result.rows.map((row: any) => ({
    spec_id: row.spec_id,
    relevance_score: row.relevance_score,
    laptop: row,
    matched_features: [],
  }));
}
