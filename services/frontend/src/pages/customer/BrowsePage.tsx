import { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, formatPrice } from '@/lib/utils';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface Laptop {
  model_id: string;
  model_name: string;
  brand_name: string;
  brand_slug: string;
  min_price: number;
  max_price: number;
  processor_model: string;
  ram_gb: number;
  storage_capacity_gb: number;
  gpu_type: string;
  gpu_model?: string;
  series?: string;
  available_count: number;
}

/**
 * Browse Page - Customer Portal
 *
 * Browse and filter all available laptops.
 * HCI: Progressive disclosure of filters, clear sorting options.
 */
export function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    minRam: searchParams.get('minRam') || '',
    maxRam: searchParams.get('maxRam') || '',
    minStorage: searchParams.get('minStorage') || '',
    maxStorage: searchParams.get('maxStorage') || '',
    gpuType: searchParams.get('gpuType') || '',
    series: searchParams.get('series') || '',
  });

  useEffect(() => {
    // Sync filters with URL params
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  useEffect(() => {
    async function fetchLaptops() {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params[key] = value;
        });
        const data = await api.getLaptops(params);
        setLaptops(data);
      } catch (err) {
        console.error('Error fetching laptops:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLaptops();
  }, [filters]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        setLoading(true);
        // Use the search API endpoint
        const results = await api.searchLaptops(searchQuery.trim());
        setLaptops(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      brand: '',
      minRam: '',
      maxRam: '',
      minStorage: '',
      maxStorage: '',
      gpuType: '',
      series: '',
    });
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browse Laptops</h1>
          <p className="text-muted-foreground">
            {laptops.length} laptops available from Gulhaji Plaza vendors
          </p>
        </div>
        <div className="flex gap-2">
          {Object.values(filters).some(v => v) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by model name, brand, or processor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-8"
          />
        </div>
        <Button onClick={handleSearch} variant="gold">
          Search
        </Button>
        {searchQuery && (
          <Button 
            onClick={() => {
              setSearchQuery('');
              // Reset to filtered results
              const params: Record<string, string> = {};
              Object.entries(filters).forEach(([key, value]) => {
                if (value) params[key] = value;
              });
              api.getLaptops(params).then(setLaptops);
            }} 
            variant="outline"
          >
            Clear
          </Button>
        )}
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
                  <Label>RAM</Label>
                  <div className="flex flex-wrap gap-2">
                    {['8', '16', '32', '64'].map((ram) => (
                      <Badge 
                        key={ram} 
                        variant={filters.minRam === ram ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleFilterChange('minRam', ram)}
                      >
                        {ram}GB
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Storage</Label>
                  <div className="flex flex-wrap gap-2">
                    {['256', '512', '1024', '2048'].map((storage) => (
                      <Badge 
                        key={storage} 
                        variant={filters.minStorage === storage ? 'default' : 'outline'} 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleFilterChange('minStorage', storage)}
                      >
                        {storage >= 1024 ? `${storage / 1024}TB` : `${storage}GB`}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>GPU Type</Label>
                  <div className="flex flex-col gap-2">
                    {['Integrated', 'Dedicated'].map((gpu) => (
                      <label key={gpu} className="flex items-center space-x-2 text-sm">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={filters.gpuType === gpu}
                          onChange={() => handleFilterChange('gpuType', filters.gpuType === gpu ? '' : gpu)}
                        />
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
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-4 bg-muted rounded w-16 mb-4"></div>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-muted rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            laptops.map((laptop) => (
              <Card key={laptop.model_id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge variant="secondary">{laptop.brand_name}</Badge>
                  <CardTitle className="mt-2">{laptop.model_name}</CardTitle>
                  <CardDescription>
                    {laptop.processor_model} • {laptop.ram_gb}GB RAM • {laptop.storage_capacity_gb}GB • {laptop.gpu_model || laptop.gpu_type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gulhaji-green">
                        {formatPrice(laptop.min_price)}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        from {laptop.available_count} vendor{laptop.available_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button size="sm" variant="gold" asChild>
                      <a href={`/product/${laptop.model_id}`}>View</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
