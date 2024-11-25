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
  try {
    const payload = {
      name: supplier.name.trim(),
      description: supplier.description.trim(),
      website: supplier.website
    };

    const response = await fetch('/api/suppliers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create supplier');
    }

    return data;
  } catch (error) {
    console.error('Supplier creation error:', error);
    throw error;
  }
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
