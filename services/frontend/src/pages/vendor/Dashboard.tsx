import { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { api, formatPrice } from '@/lib/utils';

interface InventoryItem {
  inventory_id: string;
  model_name: string;
  brand_name: string;
  unit_price: number;
  stock_quantity: number;
  condition_type: string;
  is_featured: boolean;
}

interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStock: number;
  outOfStock: number;
}

/**
 * Vendor Dashboard
 *
 * Overview of inventory, sales, and alerts.
 * HCI: At-a-glance metrics, clear action items.
 */
export function VendorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Fetch all inventory (in production, filter by authenticated vendor)
        const data = await api.getInventory({});
        setInventory(data);

        // Calculate stats from inventory
        const totalProducts = data.length;
        const totalValue = data.reduce((sum: number, item: InventoryItem) =>
          sum + (item.unit_price * item.stock_quantity), 0
        );
        const lowStock = data.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 2).length;
        const outOfStock = data.filter(item => item.stock_quantity === 0).length;

        setStats({
          totalProducts,
          totalValue,
          lowStock,
          outOfStock,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        // Use sample data as fallback for demo
        setStats({
          totalProducts: 0,
          totalValue: 0,
          lowStock: 0,
          outOfStock: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const lowStockItems = inventory
    .filter(item => item.stock_quantity > 0 && item.stock_quantity <= 2)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-gulhaji-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : 'Active listings'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-gulhaji-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : 'Based on stock × price'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : 'Needs attention'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.outOfStock}</div>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Loading...' : 'Requires restocking'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-destructive mr-2" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <div className="space-y-4">
                {lowStockItems.map((item) => (
                  <div key={item.inventory_id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.brand_name} {item.model_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Current: {item.stock_quantity} | Min: 2
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/vendor/inventory">Restock</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No low stock items. All products are well-stocked!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for managing your inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="gold" asChild>
                <Link to="/vendor/add-product">Add New Product</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/vendor/inventory">View All Inventory</Link>
              </Button>
              <Button variant="outline">Export Inventory</Button>
              <Button variant="outline">Generate Report</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
