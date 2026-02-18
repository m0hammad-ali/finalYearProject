import { Outlet, Link, useLocation } from 'react-router-dom';
import { Laptop, Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Customer Portal Layout
 * 
 * Discovery interface for laptop recommendations.
 * HCI Principles:
 * - Clear navigation hierarchy
 * - Prominent search functionality
 * - Minimal cognitive load through consistent layout
 * - Visual separation of concerns
 */
export function CustomerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/browse', label: 'Browse' },
    { path: '/recommendations', label: 'AI Recommendations' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Laptop className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-gulhaji-green">
              Gulhaji Plaza
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search laptops..."
                className="w-64 pl-8"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="gold" asChild>
              <Link to="/vendor">Vendor Portal</Link>
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
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === item.path
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col space-y-2">
              <Input type="search" placeholder="Search laptops..." />
              <Button variant="gold" className="w-full" asChild>
                <Link to="/vendor" onClick={() => setMobileMenuOpen(false)}>
                  Vendor Portal
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 Gulhaji Plaza. AI Powered Laptop Marketplace.
          </p>
          <div className="flex items-center space-x-4">
            <Link
              to="#"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Privacy
            </Link>
            <Link
              to="#"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Terms
            </Link>
            <Link
              to="#"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
