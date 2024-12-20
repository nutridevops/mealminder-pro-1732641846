import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route } from "wouter";
import "./index.css";
import "./i18n";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "./pages/HomePage";
import RecipesPage from "./pages/RecipesPage";
import PlannerPage from "./pages/PlannerPage";
import SuppliersPage from "./pages/SuppliersPage";
import ShoppingListPage from "./pages/ShoppingListPage";
import Header from "./components/Header";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/recipes" component={RecipesPage} />
          <Route path="/planner" component={PlannerPage} />
          <Route path="/suppliers" component={SuppliersPage} />
          <Route path="/shopping-list" component={ShoppingListPage} />
          <Route>404 Page Not Found</Route>
        </Switch>
      </main>
      <Toaster />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  </StrictMode>,
);
