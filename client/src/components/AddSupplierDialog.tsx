import { z } from "zod";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { insertSupplierSchema, type InsertSupplier, type Supplier } from "@db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Store, Loader2 } from "lucide-react";
import { SupplierAuthDialog } from "./SupplierAuthDialog";

const websiteSchema = z.string()
  .transform((url) => {
    if (!url) return null;
    // Clean the URL
    url = url.trim();
    return url.match(/^https?:\/\//i) ? url : `https://${url}`;
  })
  .nullable();

// Update the supplier form schema
const supplierFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  website: websiteSchema,
});

type AddSupplierDialogProps = {
  onAdd: (supplier: z.infer<typeof insertSupplierSchema>) => Promise<Supplier>;
};

export function AddSupplierDialog({ onAdd }: AddSupplierDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [createdSupplier, setCreatedSupplier] = useState<Supplier | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof supplierFormSchema>>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      active: true,
      specialties: [],
      searchTags: [],
      totalOrders: 0,
      totalRevenue: 0,
      totalCommission: 0,
    }
  });

  async function onSubmit(values: z.infer<typeof supplierFormSchema>) {
    setIsSubmitting(true);
    try {
      const sanitizedValues = {
        name: values.name.trim(),
        description: values.description.trim(),
        website: values.website,
        active: true
      };

      const supplier = await onAdd(sanitizedValues);
      setCreatedSupplier(supplier);
      form.reset();
      setOpen(false);
      setShowAuthDialog(true);
    } catch (error) {
      console.error('Supplier creation error:', error);
      toast({
        title: "Failed to add supplier",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAuthComplete = () => {
    setShowAuthDialog(false);
    toast({
      title: "Setup complete",
      description: "Supplier has been connected successfully",
      variant: "default"
    });
  };

  return (
    <>
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
                      <Input 
                        {...field}
                        type="url"
                        placeholder="example.com"
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          field.onChange(value);
                        }}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Supplier...
                  </>
                ) : (
                  <>
                    <Store className="mr-2 h-4 w-4" />
                    Add Supplier
                  </>
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {createdSupplier && (
        <SupplierAuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          supplier={createdSupplier}
          onAuthComplete={handleAuthComplete}
        />
      )}
    </>
  );
}
