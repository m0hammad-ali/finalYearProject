import { useParams } from 'react-router-dom';
import { ArrowLeft, Store, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Product Detail Page - Customer Portal
 * 
 * Detailed view of a laptop with vendor options.
 * HCI: Clear hierarchy, prominent CTAs, trust indicators.
 */
export function ProductDetailPage() {
  const { id } = useParams();

  // Mock data - would fetch from API in production
  const product = {
    id: id || '1',
    name: 'Dell XPS 15',
    brand: 'Dell',
    description: 'Premium laptop with stunning display and powerful performance.',
    price: 249999,
    specs: {
      cpu: 'Intel Core i7-13700H',
      ram: '16GB DDR5',
      storage: '512GB NVMe SSD',
      gpu: 'NVIDIA RTX 4050 6GB',
      display: '15.6" 3.5K OLED',
      weight: '1.86 kg',
      battery: '86Wh',
    },
    vendors: [
      {
        id: '1',
        shopName: 'Ali Electronics',
        shopNumber: 'Shop #123, Ground Floor',
        price: 249999,
        stock: 5,
        warranty: '2 years',
      },
      {
        id: '2',
        shopName: 'Tech World',
        shopNumber: 'Shop #45, 1st Floor',
        price: 254999,
        stock: 2,
        warranty: '1 year',
      },
    ],
  };

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
          <span className="text-muted-foreground">Product Image</span>
        </div>
        <div className="space-y-4">
          <Badge variant="secondary">{product.brand}</Badge>
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">{product.description}</p>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Specifications</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Options */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Available from {product.vendors.length} Vendors</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {product.vendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Store className="h-5 w-5 text-gulhaji-green" />
                    <div>
                      <CardTitle className="text-lg">{vendor.shopName}</CardTitle>
                      <CardDescription>{vendor.shopNumber}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={vendor.stock > 0 ? 'success' : 'destructive'}>
                    {vendor.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold text-gulhaji-green">
                      Rs. {vendor.price.toLocaleString()}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      Warranty: {vendor.warranty}
                    </p>
                  </div>
                  <Button variant="gold" disabled={vendor.stock === 0}>
                    {vendor.stock > 0 ? (
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
      </section>
    </div>
  );
}
