import { useState, useEffect } from "react";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, formatPrice } from "@/lib/utils";

interface InventoryItem {
  inventory_id: string;
  model_name: string;
  brand_name: string;
  unit_price: number;
  stock_quantity: number;
  condition_type: string;
  is_available: boolean;
  listed_at: string;
}

/**
 * Inventory Management Page - Vendor Portal
 *
 * View and manage all inventory items.
 * HCI: Clear table layout, prominent actions, search functionality.
 */
export function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInventory() {
      try {
        setLoading(true);
        // Fetch all inventory (in production, filter by authenticated vendor)
        const data = await api.getInventory({});
        setInventory(data);
      } catch (err) {
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(
    (item) =>
      item.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusVariant = (stock: number) => {
    if (stock === 0) return "destructive";
    if (stock <= 2) return "warning";
    return "success";
  };

  const getStatusLabel = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock <= 2) return "Low Stock";
    return "In Stock";
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await api.deleteInventory(id);
      setInventory(inventory.filter((item) => item.inventory_id !== id));
    } catch (err) {
      console.error("Error deleting inventory:", err);
      alert("Failed to delete item");
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
        {/* <Button variant="gold" asChild>
          <Link to="/vendor/add-product">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button> */}
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
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-10 bg-muted rounded flex-1"></div>
                  <div className="h-10 bg-muted rounded w-24"></div>
                  <div className="h-10 bg-muted rounded w-24"></div>
                  <div className="h-10 bg-muted rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Listed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      {loading ? "Loading..." : "No products found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.inventory_id}>
                      <TableCell className="font-medium">
                        {item.model_name}
                      </TableCell>
                      <TableCell>{item.brand_name}</TableCell>
                      <TableCell>{formatPrice(item.unit_price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{item.stock_quantity}</span>
                          {item.stock_quantity <= 2 &&
                            item.stock_quantity > 0 && (
                              <Badge variant="warning" className="text-xs">
                                Low
                              </Badge>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(item.stock_quantity)}>
                          {getStatusLabel(item.stock_quantity)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(item.listed_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.inventory_id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
