import { Link } from 'react-router-dom';
import { Laptop, Search, TrendingUp, Shield, Truck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Home Page - Customer Portal
 * 
 * Landing page for laptop discovery and recommendations.
 * HCI: Clear value proposition, prominent CTAs, trust indicators.
 */
export function HomePage() {
  const featuredLaptops = [
    {
      id: '1',
      name: 'Dell XPS 15',
      brand: 'Dell',
      price: 249999,
      image: '/laptop1.jpg',
      specs: { cpu: 'i7-13700H', ram: '16GB', storage: '512GB SSD' },
    },
    {
      id: '2',
      name: 'MacBook Pro 14"',
      brand: 'Apple',
      price: 329999,
      image: '/laptop2.jpg',
      specs: { cpu: 'M3 Pro', ram: '18GB', storage: '512GB SSD' },
    },
    {
      id: '3',
      name: 'Lenovo Legion 5',
      brand: 'Lenovo',
      price: 189999,
      image: '/laptop3.jpg',
      specs: { cpu: 'Ryzen 7', ram: '16GB', storage: '1TB SSD' },
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gulhaji-green to-gulhaji-gold p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Find Your Perfect Laptop
          </h1>
          <p className="mt-4 text-lg text-white/90">
            AI-powered recommendations from Gulhaji Plaza's trusted vendors.
            Compare specs, prices, and get personalized suggestions.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/recommendations">
                <TrendingUp className="mr-2 h-5 w-5" />
                Get AI Recommendations
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" asChild>
              <Link to="/browse">
                <Search className="mr-2 h-5 w-5" />
                Browse All Laptops
              </Link>
            </Button>
          </div>
        </div>
        <Laptop className="absolute -right-10 -bottom-10 h-64 w-64 text-white/10" />
      </section>

      {/* Trust Indicators */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10 text-gulhaji-green" />
              <div>
                <h3 className="font-semibold">Verified Vendors</h3>
                <p className="text-sm text-muted-foreground">
                  All sellers from Gulhaji Plaza
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Truck className="h-10 w-10 text-gulhaji-green" />
              <div>
                <h3 className="font-semibold">Same Day Pickup</h3>
                <p className="text-sm text-muted-foreground">
                  Available at selected shops
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Star className="h-10 w-10 text-gulhaji-green" />
              <div>
                <h3 className="font-semibold">Best Prices</h3>
                <p className="text-sm text-muted-foreground">
                  Compare across vendors
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Featured Laptops */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Laptops</h2>
          <Button variant="ghost" asChild>
            <Link to="/browse">View All →</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredLaptops.map((laptop) => (
            <Card key={laptop.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
              <Link to={`/product/${laptop.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">{laptop.brand}</Badge>
                  </div>
                  <CardTitle className="mt-2">{laptop.name}</CardTitle>
                  <CardDescription>
                    {laptop.specs.cpu} • {laptop.specs.ram} • {laptop.specs.storage}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gulhaji-green">
                      Rs. {laptop.price.toLocaleString()}
                    </span>
                    <Button size="sm" variant="gold">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Usage Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Shop by Usage</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {['Gaming', 'Programming', 'Design', 'Office'].map((usage) => (
            <Link
              key={usage}
              to={`/recommendations?usage=${usage.toLowerCase()}`}
              className="flex items-center justify-center p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
            >
              <span className="font-semibold">{usage}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
