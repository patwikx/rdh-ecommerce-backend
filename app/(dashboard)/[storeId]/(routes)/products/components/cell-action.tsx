"use client";

import axios from "axios";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { ProductColumn } from "./columns";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUser } from "@/lib/auth";

interface CellActionProps {
  data: ProductColumn;
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const user = useCurrentUser();

  const { toast } = useToast();

  const onConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/products/${data.id}`);
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onCopy = (barCode: string) => {
    navigator.clipboard.writeText(barCode);
    toast({
      title: "Product",
      description: "The product barcode has been copied to clipboard.",
    });
  }

  return (
    <>
      <AlertModal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => onCopy(data.barCode)}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Barcode
          </DropdownMenuItem>
          <DropdownMenuItem
  onClick={() => {
    if (user?.role !== "Administrator" && user?.role !== "Acctg") {
      toast({
        title: "Unauthorized",
        description: "You are not authorized to update this product.",
        variant: "destructive",
      });
      return;
    }
    router.push(`/${params.storeId}/products/${data.id}`);
  }}
>
  <Edit className="mr-2 h-4 w-4" /> Update
</DropdownMenuItem>
          <DropdownMenuItem
  onClick={() => {
    if (user?.role !== "Administrator" && user?.role !== "Acctg") {
      toast({
        title: "Unauthorized",
        description: "You are not authorized to delete this product.",
        variant: "destructive",
      });
      return;
    }
    setOpen(true);
  }}
>
  <Trash className="mr-2 h-4 w-4" /> Delete
</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
