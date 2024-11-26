import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ShoppingList, Product } from '@db/schema';
import { useToast } from './use-toast';

async function fetchShoppingList(): Promise<ShoppingList[]> {
  const response = await fetch('/api/shopping-list');
  if (!response.ok) {
    throw new Error('Failed to fetch shopping list');
  }
  return response.json();
}

async function addToShoppingList(items: { productId: number; quantity: number; supplierId: number }[]): Promise<ShoppingList> {
  const response = await fetch('/api/shopping-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    throw new Error('Failed to add items to shopping list');
  }
  return response.json();
}

async function updateShoppingList(id: number, items: { productId: number; quantity: number; supplierId: number }[]): Promise<ShoppingList> {
  const response = await fetch(`/api/shopping-list/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    throw new Error('Failed to update shopping list');
  }
  return response.json();
}

async function compareProductPrices(productId: number): Promise<Product[]> {
  const response = await fetch(`/api/products/${productId}/compare-prices`);
  if (!response.ok) {
    throw new Error('Failed to compare product prices');
  }
  return response.json();
}

async function checkProductStock(productId: number, supplierId: number): Promise<{ inStock: boolean; quantity?: number }> {
  const response = await fetch(`/api/products/${productId}/stock?supplierId=${supplierId}`);
  if (!response.ok) {
    throw new Error('Failed to check product stock');
  }
  return response.json();
}

export function useShoppingList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const shoppingListQuery = useQuery<ShoppingList[], Error>({
    queryKey: ['shopping-list'],
    queryFn: fetchShoppingList,
  });

  const addToListMutation = useMutation({
    mutationFn: addToShoppingList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
      toast({
        title: "Items added to shopping list",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add items",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateListMutation = useMutation({
    mutationFn: ({ id, items }: { id: number; items: { productId: number; quantity: number; supplierId: number }[] }) =>
      updateShoppingList(id, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list'] });
      toast({
        title: "Shopping list updated",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update list",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const compareProductPricesMutation = useMutation({
    mutationFn: compareProductPrices,
  });

  const checkProductStockMutation = useMutation({
    mutationFn: ({ productId, supplierId }: { productId: number; supplierId: number }) =>
      checkProductStock(productId, supplierId),
  });

  return {
    shoppingList: shoppingListQuery.data ?? [],
    isLoading: shoppingListQuery.isLoading,
    error: shoppingListQuery.error,
    addToList: addToListMutation.mutateAsync,
    updateList: updateListMutation.mutateAsync,
    compareProductPrices: compareProductPricesMutation.mutateAsync,
    checkProductStock: checkProductStockMutation.mutateAsync,
  };
}
