import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/utils';

/**
 * Add Product Page - Vendor Portal
 *
 * Form to add new laptop to inventory.
 * HCI: Clear form layout, validation feedback, progress indication.
 */
export function AddProductPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Product Info
    brand: '',
    model: '',
    series: '',
    // Specs
    cpu: '',
    ram: '',
    storage: '',
    gpu: '',
    display: '',
    // Pricing
    price: '',
    stock: '',
    warranty: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Map form data to API format
      const inventoryData = {
        model_id: formData.model, // In production, this would be a proper model_id from DB
        unit_price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock, 10),
        condition_type: 'New' as const,
        warranty_months: formData.warranty ? parseInt(formData.warranty, 10) : 12,
      };

      // Call API to create inventory
      await api.createInventory(inventoryData);
      
      // Navigate to inventory page on success
      navigate('/vendor/inventory');
    } catch (err: any) {
      setError(err.message || 'Failed to add product. Please try again.');
      console.error('Error adding product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/vendor/inventory">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">
            List a new laptop in your inventory
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {['Product Info', 'Specifications', 'Pricing'].map((label, index) => (
          <div key={label} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step > index + 1
                  ? 'bg-gulhaji-green text-white'
                  : step === index + 1
                  ? 'bg-gulhaji-gold text-gulhaji-green'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > index + 1 ? '✓' : index + 1}
            </div>
            <span
              className={`ml-2 text-sm ${
                step === index + 1 ? 'font-medium' : 'text-muted-foreground'
              }`}
            >
              {label}
            </span>
            {index < 2 && (
              <div className={`w-12 h-0.5 mx-4 ${step > index + 1 ? 'bg-gulhaji-green' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center text-destructive">
            {error}
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Product Information'}
              {step === 2 && 'Hardware Specifications'}
              {step === 3 && 'Pricing & Stock'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Enter the basic product details'}
              {step === 2 && 'Specify the hardware configuration'}
              {step === 3 && 'Set your price and stock levels'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <select
                      id="brand"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    >
                      <option value="">Select brand</option>
                      <option value="dell">Dell</option>
                      <option value="hp">HP</option>
                      <option value="lenovo">Lenovo</option>
                      <option value="asus">ASUS</option>
                      <option value="acer">Acer</option>
                      <option value="apple">Apple</option>
                      <option value="msi">MSI</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model Name *</Label>
                    <Input
                      id="model"
                      placeholder="e.g., XPS 15"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="series">Series</Label>
                  <Input
                    id="series"
                    placeholder="e.g., Gaming, Ultrabook, Workstation"
                    value={formData.series}
                    onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cpu">Processor *</Label>
                    <Input
                      id="cpu"
                      placeholder="e.g., Intel i7-13700H"
                      value={formData.cpu}
                      onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ram">RAM *</Label>
                    <select
                      id="ram"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.ram}
                      onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                      required
                    >
                      <option value="">Select RAM</option>
                      <option value="8">8GB</option>
                      <option value="16">16GB</option>
                      <option value="32">32GB</option>
                      <option value="64">64GB</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="storage">Storage *</Label>
                    <Input
                      id="storage"
                      placeholder="e.g., 512GB NVMe SSD"
                      value={formData.storage}
                      onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gpu">Graphics Card</Label>
                    <Input
                      id="gpu"
                      placeholder="e.g., NVIDIA RTX 4050"
                      value={formData.gpu}
                      onChange={(e) => setFormData({ ...formData, gpu: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display">Display</Label>
                  <Input
                    id="display"
                    placeholder="e.g., 15.6&quot; FHD 144Hz"
                    value={formData.display}
                    onChange={(e) => setFormData({ ...formData, display: e.target.value })}
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (PKR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g., 249999"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="e.g., 5"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    placeholder="e.g., 2 years manufacturer warranty"
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1 || loading}
              >
                Previous
              </Button>
              {step < 3 ? (
                <Button 
                  type="button" 
                  variant="gold" 
                  onClick={() => setStep(Math.min(3, step + 1))}
                  disabled={loading}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  variant="gold"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add to Inventory'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
