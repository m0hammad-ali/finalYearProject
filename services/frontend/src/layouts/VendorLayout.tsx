import { Outlet, Link, useLocation } from 'react-router-dom';
import { Store, Package, PlusCircle, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Vendor Portal Layout
 * 
 * Inventory management dashboard for Gulhaji Plaza shopkeepers.
 * HCI Principles:
 * - Focused workspace for business tasks
 * - Clear action hierarchy (Add Product is prominent)
 * - Dashboard metrics at a glance
 * - Consistent navigation pattern
 */
export function VendorLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/vendor', label: 'Dashboard', icon: BarChart3 },
    { path: '/vendor/inventory', label: 'Inventory', icon: Package },
    { path: '/vendor/add-product', label: 'Add Product', icon: PlusCircle },
  ];

  // Mock vendor data (would come from auth context in production)
  const vendor = {
    shopName: 'Ali Electronics',
    shopNumber: 'Shop #123, Ground Floor',
    totalProducts: 45,
    lowStock: 3,
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Vendor Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Store className="h-6 w-6 text-gulhaji-green" />
            <div>
              <span className="text-lg font-bold text-gulhaji-green">
                Vendor Portal
              </span>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {vendor.shopName}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Badge variant={vendor.lowStock > 0 ? 'destructive' : 'success'}>
              {vendor.lowStock > 0
                ? `${vendor.lowStock} Low Stock`
                : 'All Stocked'}
            </Badge>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
            <Button variant="gold" asChild>
              <Link to="/">Customer View</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t p-4 space-y-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium',
                      location.pathname === item.path
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="flex flex-col space-y-2">
              <Button variant="gold" className="w-full" asChild>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  Customer View
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Vendor Stats Bar */}
      <div className="border-b bg-background">
        <div className="container py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-muted-foreground">Total Products:</span>{' '}
                <span className="font-semibold">{vendor.totalProducts}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Low Stock:</span>{' '}
                <span
                  className={cn(
                    'font-semibold',
                    vendor.lowStock > 0 ? 'text-destructive' : 'text-green-600'
                  )}
                >
                  {vendor.lowStock}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Shop:</span>{' '}
                <span className="font-semibold">{vendor.shopNumber}</span>
              </div>
            </div>
            <Button size="sm" variant="gold" asChild className="hidden md:flex">
              <Link to="/vendor/add-product">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Gulhaji Plaza Vendor Portal - Inventory Management System</p>
          <p className="mt-1">Need help? Contact support@gulhajiplaza.com</p>
        </div>
      </footer>
    </div>
  );
}
