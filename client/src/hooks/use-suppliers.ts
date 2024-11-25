import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InsertSupplier, Supplier, Product } from '@db/schema';

async function fetchSuppliers(): Promise<Supplier[]> {
  const response = await fetch('/api/suppliers');
  if (!response.ok) {
    throw new Error('Failed to fetch suppliers');
  }
  return response.json();
}

async function fetchSupplierProducts(supplierId: number): Promise<Product[]> {
  const response = await fetch(`/api/suppliers/${supplierId}/products`);
  if (!response.ok) {
    throw new Error('Failed to fetch supplier products');
  }
  return response.json();
}

async function createSupplier(supplier: InsertSupplier): Promise<Supplier> {
  const response = await fetch('/api/suppliers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(supplier),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create supplier');
  }

  return response.json();
}

export function useSuppliers() {
  const queryClient = useQueryClient();

  const suppliersQuery = useQuery<Supplier[], Error>({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  });

  const createSupplierMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const getSupplierProducts = async (supplierId: number) => {
    return queryClient.fetchQuery({
      queryKey: ['suppliers', supplierId, 'products'],
      queryFn: () => fetchSupplierProducts(supplierId),
    });
  };

  return {
    suppliers: suppliersQuery.data ?? [],
    isLoading: suppliersQuery.isLoading,
    error: suppliersQuery.error,
    createSupplier: createSupplierMutation.mutateAsync,
    getSupplierProducts,
  };
}
