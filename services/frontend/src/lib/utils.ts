import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes
 * Combines clsx for conditional classes with tailwind-merge for conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in PKR
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * API Base URL from environment or default
 * In development (Vite), use relative URL to leverage proxy
 * In production, use the environment variable if set
 */
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000')
  : ''; // Empty string means relative URL (uses Vite proxy)

/**
 * Generic API fetch wrapper with error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * API endpoints
 */
export const api = {
  // Laptops
  getLaptops: (params?: Record<string, string>) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiFetch(`/api/v1/laptops${queryString ? `?${queryString}` : ''}`);
  },
  getLaptopById: (id: string) => apiFetch(`/api/v1/laptops/${id}`),
  searchLaptops: (query: string) => apiFetch(`/api/v1/laptops/search/${encodeURIComponent(query)}`),
  
  // Brands
  getBrands: () => apiFetch('/api/v1/brands'),
  
  // Inventory
  getInventory: (params?: Record<string, string>) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiFetch(`/api/v1/inventory${queryString ? `?${queryString}` : ''}`);
  },
  getInventoryById: (id: string) => apiFetch(`/api/v1/inventory/${id}`),
  getVendorInventory: (vendorId: string) => apiFetch(`/api/v1/inventory/vendor/${vendorId}`),
  createInventory: (data: any) => apiFetch('/api/v1/inventory', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateInventory: (id: string, data: any) => apiFetch(`/api/v1/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteInventory: (id: string) => apiFetch(`/api/v1/inventory/${id}`, {
    method: 'DELETE',
  }),
  updateStock: (id: string, quantity: number, operation: 'add' | 'remove' | 'set') => 
    apiFetch(`/api/v1/inventory/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, operation }),
    }),
  
  // Recommendations
  getRecommendations: (preferences: any, topK?: number) => apiFetch('/api/v1/recommendations', {
    method: 'POST',
    body: JSON.stringify({ user_preferences: preferences, top_k: topK || 5 }),
  }),
  getTrending: () => apiFetch('/api/v1/recommendations/trending'),
  getByUsage: (usage: string, limit?: number) => 
    apiFetch(`/api/v1/recommendations/by-usage/${usage}${limit ? `?limit=${limit}` : ''}`),
  
  // Users
  login: (email: string, password: string) => apiFetch('/api/v1/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (data: any) => apiFetch('/api/v1/users/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
