import { useState } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * Browse Page - Customer Portal
 * 
 * Browse and filter all available laptops.
 * HCI: Progressive disclosure of filters, clear sorting options.
 */
export function BrowsePage() {
  const [showFilters, setShowFilters] = useState(false);

  const laptops = [
    {
      id: '1',
      name: 'Dell XPS 15',
      brand: 'Dell',
      price: 249999,
      specs: { cpu: 'i7-13700H', ram: 16, storage: 512, gpu: 'RTX 4050' },
      vendors: 3,
    },
    {
      id: '2',
      name: 'HP Pavilion Gaming',
      brand: 'HP',
      price: 159999,
      specs: { cpu: 'i5-13400H', ram: 16, storage: 512, gpu: 'RTX 3050' },
      vendors: 2,
    },
    // Add more mock data
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browse Laptops</h1>
          <p className="text-muted-foreground">
            {laptops.length} laptops available from Gulhaji Plaza vendors
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <aside className="w-64 space-y-6 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <SlidersHorizontal className="inline mr-2 h-4 w-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Min" type="number" />
                    <Input placeholder="Max" type="number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>RAM</Label>
                  <div className="flex flex-wrap gap-2">
                    {['8GB', '16GB', '32GB', '64GB'].map((ram) => (
                      <Badge key={ram} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {ram}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Storage</Label>
                  <div className="flex flex-wrap gap-2">
                    {['256GB', '512GB', '1TB', '2TB'].map((storage) => (
                      <Badge key={storage} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        {storage}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>GPU Type</Label>
                  <div className="flex flex-col gap-2">
                    {['Integrated', 'Dedicated'].map((gpu) => (
                      <label key={gpu} className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <span>{gpu}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        )}

        {/* Laptop Grid */}
        <div className="flex-1 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {laptops.map((laptop) => (
            <Card key={laptop.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Badge variant="secondary">{laptop.brand}</Badge>
                <CardTitle className="mt-2">{laptop.name}</CardTitle>
                <CardDescription>
                  {laptop.specs.cpu} • {laptop.specs.ram}GB RAM • {laptop.specs.storage}GB • {laptop.specs.gpu}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gulhaji-green">
                      Rs. {laptop.price.toLocaleString()}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      from {laptop.vendors} vendor{laptop.vendors > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button size="sm" variant="gold">
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
