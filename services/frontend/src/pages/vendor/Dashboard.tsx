import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

/**
 * Vendor Dashboard
 * 
 * Overview of inventory, sales, and alerts.
 * HCI: At-a-glance metrics, clear action items.
 */
export function VendorDashboard() {
  const stats = [
    {
      title: 'Total Products',
      value: '45',
      change: '+3 this week',
      icon: Package,
      color: 'text-gulhaji-green',
    },
    {
      title: 'Total Value',
      value: 'Rs. 4.5M',
      change: '+12% from last month',
      icon: DollarSign,
      color: 'text-gulhaji-gold',
    },
    {
      title: 'Low Stock',
      value: '3',
      change: 'Needs attention',
      icon: AlertTriangle,
      color: 'text-destructive',
    },
    {
      title: 'Views This Week',
      value: '1,234',
      change: '+25% from last week',
      icon: TrendingUp,
      color: 'text-primary',
    },
  ];

  const recentActivity = [
    { id: 1, action: 'Product added', item: 'Dell XPS 15', time: '2 hours ago' },
    { id: 2, action: 'Stock updated', item: 'HP Pavilion (5 → 3)', time: '5 hours ago' },
    { id: 3, action: 'Price changed', item: 'Lenovo Legion 5', time: '1 day ago' },
  ];

  const lowStockItems = [
    { id: 1, name: 'MacBook Air M2', current: 1, min: 2 },
    { id: 2, name: 'ASUS TUF Gaming', current: 2, min: 3 },
    { id: 3, name: 'HP Spectre x360', current: 1, min: 2 },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
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
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current: {item.current} | Min: {item.min}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest inventory changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.item}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
  );
}
