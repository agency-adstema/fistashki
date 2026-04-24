/**
 * Kopiraj u Next admin: src/hooks/useProducts.ts
 * VAŽNO: PATCH mora slati samo `payload`, ne spread celog product objekta (inStock, images, …).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

type ApiEnvelope<T> = { success?: boolean; message?: string; data?: T };

function unwrap<T>(body: ApiEnvelope<T> | T | undefined): T {
  if (body && typeof body === 'object' && 'data' in (body as ApiEnvelope<T>)) {
    const b = body as ApiEnvelope<T>;
    if (b.data !== undefined) return b.data;
  }
  return body as T;
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<unknown>>(`/products/${id}`);
      return unwrap(data);
    },
    enabled: Boolean(id),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    /**
     * Telo mora biti ravno `payload` (polja DTO), NE `{ payload }`, NE `spread` celog GET product-a
     * (inStock, productCategories, … ruše validaciju ili ostave prazan update).
     */
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const { data } = await api.patch<ApiEnvelope<unknown>>(`/products/${id}`, payload);
      return unwrap(data);
    },
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'product', id] });
      void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiEnvelope<unknown>>(`/products/${id}`);
      return unwrap(data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post<ApiEnvelope<{ id: string }>>(`/products`, payload);
      return unwrap(data) as { id: string };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });
}
