import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Store, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, formatPrice } from '@/lib/utils';

interface Vendor {
  inventory_id: string;
  vendor_id: string;
  shop_name: string;
  shop_number: string;
  plaza_name?: string;
  unit_price: number;
  stock_quantity: number;
  warranty_months: number;
  contact_phone?: string;
}

interface Product {
  model_id: string;
  model_name: string;
  brand_name: string;
  brand_slug: string;
  short_description?: string;
  product_image_url?: string;
  processor_brand: string;
  processor_model: string;
  processor_cores: number;
  ram_gb: number;
  ram_type: string;
  storage_type: string;
  storage_capacity_gb: number;
  gpu_type: string;
  gpu_brand?: string;
  gpu_model?: string;
  display_size_inches: number;
  display_resolution: string;
  weight_kg?: number;
  battery_whr?: number;
  inventory: Vendor[];
}

/**
 * Product Detail Page - Customer Portal
 *
 * Detailed view of a laptop with vendor options.
 * HCI: Clear hierarchy, prominent CTAs, trust indicators.
 */
export function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.getLaptopById(id);
        setProduct(data);
        setError(null);
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" asChild>
          <Link to="/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Link>
        </Button>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-video rounded-lg bg-muted animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-muted rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" asChild>
          <Link to="/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>{error || 'Product not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link to="/browse">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Link>
      </Button>

      {/* Product Header */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
          {product.product_image_url ? (
            <img 
              src={product.product_image_url} 
              alt={product.model_name}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <span className="text-muted-foreground">Product Image</span>
          )}
        </div>
        <div className="space-y-4">
          <Badge variant="secondary">{product.brand_name}</Badge>
          <h1 className="text-4xl font-bold">{product.model_name}</h1>
          <p className="text-muted-foreground">{product.short_description || 'High-performance laptop'}</p>

          <div className="space-y-2">
            <h3 className="font-semibold">Specifications</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processor:</span>
                <span className="font-medium">{product.processor_brand} {product.processor_model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">RAM:</span>
                <span className="font-medium">{product.ram_gb}GB {product.ram_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage:</span>
                <span className="font-medium">{product.storage_capacity_gb}GB {product.storage_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Graphics:</span>
                <span className="font-medium">{product.gpu_brand} {product.gpu_model || product.gpu_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Display:</span>
                <span className="font-medium">{product.display_size_inches}" {product.display_resolution}</span>
              </div>
              {product.weight_kg && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">{product.weight_kg} kg</span>
                </div>
              )}
              {product.battery_whr && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Battery:</span>
                  <span className="font-medium">{product.battery_whr}Wh</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Options */}
      <section>
        <h2 className="text-2xl font-bold mb-4">
          Available from {product.inventory?.length || 0} Vendors
        </h2>
        {product.inventory && product.inventory.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {product.inventory.map((vendor) => (
              <Card key={vendor.inventory_id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Store className="h-5 w-5 text-gulhaji-green" />
                      <div>
                        <CardTitle className="text-lg">{vendor.shop_name}</CardTitle>
                        <CardDescription>
                          {vendor.shop_number}
                          {vendor.plaza_name && `, ${vendor.plaza_name}`}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={vendor.stock_quantity > 0 ? 'success' : 'destructive'}>
                      {vendor.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-gulhaji-green">
                        {formatPrice(vendor.unit_price)}
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Warranty: {vendor.warranty_months} {vendor.warranty_months === 1 ? 'month' : 'months'}
                      </p>
                    </div>
                    <Button variant="gold" disabled={vendor.stock_quantity === 0}>
                      {vendor.stock_quantity > 0 ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Contact Vendor
                        </>
                      ) : (
                        'Out of Stock'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>Currently unavailable from any vendor</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
