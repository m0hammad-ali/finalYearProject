import { Routes, Route } from 'react-router-dom';
import { CustomerLayout } from './layouts/CustomerLayout';
import { VendorLayout } from './layouts/VendorLayout';
import { HomePage } from './pages/customer/HomePage';
import { BrowsePage } from './pages/customer/BrowsePage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { RecommendationsPage } from './pages/customer/RecommendationsPage';
import { VendorDashboard } from './pages/vendor/Dashboard';
import { InventoryPage } from './pages/vendor/InventoryPage';
import { AddProductPage } from './pages/vendor/AddProductPage';
import { NotFoundPage } from './pages/NotFoundPage';

/**
 * Main App Component
 * 
 * Routes are organized by portal type:
 * - Customer Portal: Discovery interface for laptop recommendations
 * - Vendor Portal: Inventory management for Gulhaji Plaza shopkeepers
 * 
 * HCI Principles Applied:
 * - Clear visual separation between portals
 * - Consistent navigation patterns
 * - Minimal cognitive load through focused layouts
 */
function App() {
  return (
    <Routes>
      {/* Customer Portal Routes */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index element={<HomePage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="product/:id" element={<ProductDetailPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
      </Route>

      {/* Vendor Portal Routes */}
      <Route path="/vendor" element={<VendorLayout />}>
        <Route index element={<VendorDashboard />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="add-product" element={<AddProductPage />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
