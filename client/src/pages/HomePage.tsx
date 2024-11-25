import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChefHat } from "lucide-react";
import { Link } from "wouter";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-lg">
        <AspectRatio ratio={21/9}>
          <img
            src="https://images.unsplash.com/photo-1487376318617-f43c7b41e2e2"
            alt="Fresh healthy ingredients"
            className="object-cover w-full h-full brightness-50"
          />
        </AspectRatio>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white space-y-4 px-4">
            <h1 className="text-4xl md:text-6xl font-bold">
              Plan Your Healthy Meals
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Create nutritious meal plans, discover healthy recipes, and generate smart shopping lists
            </p>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <img
            src="https://images.unsplash.com/photo-1556911073-52527ac43761"
            alt="Recipe collection"
            className="rounded-lg aspect-video object-cover"
          />
          <h2 className="text-2xl font-semibold">Discover Recipes</h2>
          <p className="text-muted-foreground">
            Browse our collection of healthy recipes with detailed nutritional information
          </p>
          <Button asChild>
            <Link href="/recipes" className="inline-flex items-center">
              <ChefHat className="mr-2 h-4 w-4" />
              View Recipes
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          <img
            src="https://images.unsplash.com/photo-1533115149875-0a1c8612f726"
            alt="Meal planning"
            className="rounded-lg aspect-video object-cover"
          />
          <h2 className="text-2xl font-semibold">Plan Your Week</h2>
          <p className="text-muted-foreground">
            Create balanced meal plans and automatically generate shopping lists
          </p>
          <Button asChild>
            <Link href="/planner" className="inline-flex items-center">
              <CalendarDays className="mr-2 h-4 w-4" />
              Start Planning
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
