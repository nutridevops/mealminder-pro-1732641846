import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays, 
  ChefHat, 
  Home,
  Store
} from "lucide-react";

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MealMinder</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant={location === "/" ? "default" : "ghost"}
              asChild
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>

            <Button
              variant={location === "/recipes" ? "default" : "ghost"}
              asChild
            >
              <Link href="/recipes" className="flex items-center gap-2">
                <ChefHat className="h-4 w-4" />
                Recipes
              </Link>
            </Button>

            <Button
              variant={location === "/planner" ? "default" : "ghost"}
              asChild
            >
              <Link href="/planner" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Meal Planner
              </Link>
            </Button>

            <Button
              variant={location === "/suppliers" ? "default" : "ghost"}
              asChild
            >
              <Link href="/suppliers" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Suppliers
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
