import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Supplier } from "@db/schema";

interface SupplierAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier;
  onAuthComplete: () => void;
}

export function SupplierAuthDialog({ 
  open, 
  onOpenChange, 
  supplier,
  onAuthComplete 
}: SupplierAuthDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOAuthLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/${provider}?supplierId=${supplier.id}`);
      if (!response.ok) {
        throw new Error(`Failed to authenticate with ${provider}`);
      }
      
      const data = await response.json();
      
      // Redirect to provider's OAuth page
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
      
      onAuthComplete();
      toast({
        title: "Authentication Successful",
        description: `Successfully connected with ${provider}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect {supplier.name} with Provider</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthLogin('google')}
            disabled={isLoading}
          >
            {isLoading ? (
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
            variant="outline"
            className="w-full"
            onClick={() => handleOAuthLogin('microsoft')}
            disabled={isLoading}
          >
            {isLoading ? (
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
      </DialogContent>
    </Dialog>
  );
}
