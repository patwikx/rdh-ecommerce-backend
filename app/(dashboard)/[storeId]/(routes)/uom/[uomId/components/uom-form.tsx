"use client"

import * as z from "zod"
import axios from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { Trash } from "lucide-react"
import { UoM } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { AlertModal } from "@/components/modals/alert-modal"
import { Heading } from "@/components/ui/heading"

const formSchema = z.object({
  UoM: z.string().min(2),
});

type UoMFormValues = z.infer<typeof formSchema>

interface UoMFormProps {
  initialData: UoM | null;
};

export const UoMForm: React.FC<UoMFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit UoM' : 'Create UoM';
  const description = initialData ? 'Edit a UoM.' : 'Add a new UoM';
  const toastMessage = initialData ? 'UoM updated.' : 'UoM created.';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<UoMFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      UoM: ''
    }
  });

  const onSubmit = async (data: UoMFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/uom/${params.uomId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/uom`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/uom`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/uom/${params.uomId}`);
      router.refresh();
      router.push(`/${params.storeId}/uom`);
      toast.success('UoM deleted.');
    } catch (error: any) {
      toast.error('Make sure you removed all products using this color first.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
    <AlertModal 
      isOpen={open} 
      onClose={() => setOpen(false)}
      onConfirm={onDelete}
      loading={loading}
    />
     <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="UoM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Color name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
