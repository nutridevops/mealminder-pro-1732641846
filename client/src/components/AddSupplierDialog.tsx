import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { insertSupplierSchema, type InsertSupplier } from "@db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Store } from "lucide-react";
import type { z } from "zod";

type AddSupplierDialogProps = {
  onAdd: (supplier: z.infer<typeof insertSupplierSchema>) => Promise<void>;
};

export function AddSupplierDialog({ onAdd }: AddSupplierDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof insertSupplierSchema>>({
    resolver: zodResolver(insertSupplierSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      active: true,
      specialties: [],
      searchTags: [],
      oauthProvider: undefined,
      oauthId: undefined,
      oauthTokens: undefined
    }
  });

  const handleOAuthLogin = async (provider: string) => {
    setIsOAuthLoading(true);
    try {
      // OAuth login logic will be implemented here
      const response = await fetch(`/api/auth/${provider}`);
      if (!response.ok) {
        throw new Error(`Failed to authenticate with ${provider}`);
      }
      // Handle successful OAuth login
      toast({
        title: "Authentication Successful",
        description: `Successfully authenticated with ${provider}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsOAuthLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof insertSupplierSchema>) {
    setIsSubmitting(true);
    try {
      await onAdd(values);
      setOpen(false);
      form.reset();
      toast({
        title: "Supplier added successfully",
        description: "The supplier has been added to your network",
        variant: "default"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Please try again";
      toast({
        title: "Failed to add supplier",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Store className="h-4 w-4 mr-2" />
          Add New Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="text-sm font-medium">Connect with Provider</div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isOAuthLoading}
                >
                  {isOAuthLoading ? (
                    <div className="animate-spin mr-2">⭮</div>
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.607,2.667-3.074,4.664-5.99,4.664c-3.314,0-6-2.686-6-6s2.686-6,6-6c1.503,0,2.875,0.555,3.926,1.468l2.828-2.828C17.949,3.968,15.701,3,13,3C7.477,3,3,7.477,3,13s4.477,10,10,10c5.523,0,10-4.477,10-10v-1.909h-9.455C12.69,11.091,12.545,11.594,12.545,12.151z"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthLogin('microsoft')}
                  disabled={isOAuthLoading}
                >
                  {isOAuthLoading ? (
                    <div className="animate-spin mr-2">⭮</div>
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M11.5 2v9.5H2V2h9.5zm0 10.5V22H2v-9.5h9.5zM22 2v9.5h-9.5V2H22zm0 10.5V22h-9.5v-9.5H22z"
                      />
                    </svg>
                  )}
                  Continue with Microsoft
                </Button>
              </div>
            </div>
            
            <Button type="submit" className="w-full">
              Add Supplier
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
