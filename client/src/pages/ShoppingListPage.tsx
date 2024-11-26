import { ShoppingList } from "@/components/ShoppingList";
import { useTranslation } from "react-i18next";

export default function ShoppingListPage() {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">
        {t('shopping.title', 'Shopping List')}
      </h1>
      <ShoppingList />
    </div>
  );
}
