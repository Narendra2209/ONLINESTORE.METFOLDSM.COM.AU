import api from '@/lib/axios';
import { Product, Category, Attribute, PriceCalculationResponse, ProductFilters } from '@/types/product';
import { ApiResponse, PaginationMeta } from '@/types/api';

export const productApi = {
  async getProducts(filters: ProductFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    const { data } = await api.get<ApiResponse<Product[]>>(`/products?${params}`);
    return data;
  },

  async getProductBySlug(slug: string) {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${slug}`);
    return data.data;
  },

  async calculatePrice(productId: string, body: {
    selectedAttributes: Record<string, string>;
    length?: number;
    quantity: number;
  }) {
    const { data } = await api.post<ApiResponse<PriceCalculationResponse>>(
      `/products/${productId}/calculate-price`,
      body
    );
    return data.data;
  },

  async getCategories() {
    const { data } = await api.get<ApiResponse<Category[]>>('/categories');
    return data.data;
  },

  async getCategoryBySlug(slug: string) {
    const { data } = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
    return data.data;
  },

  async getFilterableAttributes() {
    const { data } = await api.get<ApiResponse<Attribute[]>>('/products/attributes/filterable');
    return data.data;
  },
};
