"use client"

import * as z from "zod"
import axios from "axios"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Trash } from "lucide-react"
import { Billboard } from "@prisma/client"
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
import { UploadButton } from "@uploadthing/react"
import { Label } from "@/components/ui/label"

import type { OurFileRouter } from "@/app/api/uploadthing/core" 
import { Heading } from "@/components/ui/heading"
import { useToast } from "@/hooks/use-toast"

type UploadThingFile = {
  url: string;
  name: string;
};

const formSchema = z.object({
  label: z.string().min(1),
  imageUrl: z.string().min(1, "Image URL is required"),
});

type BillboardFormValues = z.infer<typeof formSchema>

interface BillboardFormProps {
  initialData: Billboard | null;
};

export const BillboardForm: React.FC<BillboardFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit billboard' : 'Create billboard';
  const description = initialData ? 'Edit a billboard.' : 'Add a new billboard';
  const toastMessage = initialData ? 'Billboard updated.' : 'Billboard created.';
  const action = initialData ? 'Save changes' : 'Create';
  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);
  const [uploadedFileNames, setUploadedFileNames] = useState<string[]>([]);

  const form = useForm<BillboardFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      label: '',
      imageUrl: ''
    }
  });

  const onSubmit = async (data: BillboardFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/billboards`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/billboards`);
      toast({
        title: initialData ? "Billboard Updated" : "Billboard Created",
        description: initialData ? "Your billboard has been updated successfully." : "Your billboard have been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`);
      router.refresh();
      router.push(`/${params.storeId}/billboards`);
      toast({
        title: "Billboard",
        description: "Billboard successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Make sure you removed all categories using this billboard first.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  const handleFileUpload = (res: UploadThingFile[]) => {
    if (res && res.length > 0) {
      const fileUrls = res.map((file: UploadThingFile) => file.url);
      const fileNames = res.map((file: UploadThingFile) => file.name);
      setUploadedFileUrls(prevUrls => [...prevUrls, ...fileUrls]);
      setUploadedFileNames(prevNames => [...prevNames, ...fileNames]);
      
      // Set the first uploaded file URL to the imageUrl field
      form.setValue('imageUrl', fileUrls[0]);
      
      toast({
        title: "Upload",
        description: "Upload completed successfully.",
      });
    }
  };

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
          <div className="mt-2 flex flex-col items-center justify-center">
            <label className="block text-center">
              <div className="flex flex-col items-center mt-4">
                <label className="flex flex-col items-center p-4 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-gray-600 transition duration-300">
                  <span className="text-center font-bold text-md mb-2 text-gray-600">Background Images</span>
                  <UploadButton<OurFileRouter, "image">
                    endpoint="image"
                    onClientUploadComplete={handleFileUpload}
                    onUploadError={(error: Error) => {
                      toast({
                        title: "Error",
                        description: "Something went wrong. Please try again.",
                        variant: "destructive",
                      });
                    }}
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-gray-500">Drag & Drop or Click to Upload</span>
                  </div>
                </label>
              </div>
            </label>
            {uploadedFileNames.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <Label className="font-bold">Uploaded files: </Label>
                <ul className="list-disc pl-5">
                  {uploadedFileNames.map((fileName, index) => (
                    <li key={index}>{fileName}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Billboard label" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Image URL" {...field} />
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