import { useState } from 'react';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Inventory Management Page - Vendor Portal
 * 
 * View and manage all inventory items.
 * HCI: Clear table layout, prominent actions, search functionality.
 */
export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const inventory = [
    {
      id: '1',
      product: 'Dell XPS 15',
      brand: 'Dell',
      price: 249999,
      stock: 5,
      minStock: 2,
      status: 'In Stock',
      lastUpdated: '2024-02-15',
    },
    {
      id: '2',
      product: 'MacBook Air M2',
      brand: 'Apple',
      price: 189999,
      stock: 1,
      minStock: 2,
      status: 'Low Stock',
      lastUpdated: '2024-02-14',
    },
    {
      id: '3',
      product: 'HP Pavilion Gaming',
      brand: 'HP',
      price: 159999,
      stock: 8,
      minStock: 3,
      status: 'In Stock',
      lastUpdated: '2024-02-13',
    },
    {
      id: '4',
      product: 'Lenovo Legion 5',
      brand: 'Lenovo',
      price: 189999,
      stock: 0,
      minStock: 2,
      status: 'Out of Stock',
      lastUpdated: '2024-02-12',
    },
  ];

  const filteredInventory = inventory.filter(
    (item) =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'success';
      case 'Low Stock':
        return 'warning';
      case 'Out of Stock':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            Manage your product listings and stock levels
          </p>
        </div>
        <Button variant="gold" asChild>
          <Link to="/vendor/add-product">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Products ({filteredInventory.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product}</TableCell>
                  <TableCell>{item.brand}</TableCell>
                  <TableCell>Rs. {item.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{item.stock}</span>
                      {item.stock <= item.minStock && item.stock > 0 && (
                        <Badge variant="warning" className="text-xs">
                          Low
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.lastUpdated}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
