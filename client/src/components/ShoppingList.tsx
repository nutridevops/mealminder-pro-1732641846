import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useShoppingList } from "@/hooks/use-shopping-list";
import { useSuppliers } from "@/hooks/use-suppliers";
import { Loader2, ShoppingCart, Store, RefreshCcw } from "lucide-react";
import type { Product } from "@db/schema";

type ShoppingListItem = {
  productId: number;
  quantity: number;
  supplierId: number;
  product?: Product;
  price?: number;
  inStock?: boolean;
};

export function ShoppingList() {
  const { 
    shoppingList, 
    isLoading, 
    addToList, 
    updateList,
    compareProductPrices,
    checkProductStock
  } = useShoppingList();
  const { suppliers } = useSuppliers();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (shoppingList.length > 0) {
      setItems(shoppingList[0].items);
    }
  }, [shoppingList]);

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = quantity;
    setItems(newItems);
  };

  const handleUpdateList = async () => {
    if (shoppingList.length === 0) return;
    
    setIsUpdating(true);
    try {
      await updateList({
        id: shoppingList[0].id,
        items: items.map(({ productId, quantity, supplierId }) => ({
          productId,
          quantity,
          supplierId
        }))
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckStock = async (index: number) => {
    const item = items[index];
    try {
      const stockInfo = await checkProductStock({
        productId: item.productId,
        supplierId: item.supplierId
      });
      
      const newItems = [...items];
      newItems[index].inStock = stockInfo.inStock;
      setItems(newItems);
    } catch (error) {
      console.error('Failed to check stock:', error);
    }
  };

  const handleComparePrices = async (index: number) => {
    const item = items[index];
    try {
      const priceComparisons = await compareProductPrices(item.productId);
      // Update the item with the lowest price found
      if (priceComparisons.length > 0) {
        const lowestPrice = Math.min(...priceComparisons.map(p => p.price));
        const bestSupplier = priceComparisons.find(p => p.price === lowestPrice);
        
        if (bestSupplier) {
          const newItems = [...items];
          newItems[index].supplierId = bestSupplier.supplierId;
          newItems[index].price = bestSupplier.price;
          setItems(newItems);
        }
      }
    } catch (error) {
      console.error('Failed to compare prices:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Shopping List
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={`${item.productId}-${index}`}>
                <TableCell>{item.product?.name}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  {suppliers.find(s => s.id === item.supplierId)?.name}
                </TableCell>
                <TableCell>
                  {item.price ? `$${(item.price / 100).toFixed(2)}` : '-'}
                </TableCell>
                <TableCell>
                  {item.inStock !== undefined ? (
                    <span className={item.inStock ? "text-green-600" : "text-red-600"}>
                      {item.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCheckStock(index)}
                    >
                      <Store className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleComparePrices(index)}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleUpdateList}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update List"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
