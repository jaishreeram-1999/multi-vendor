"use client";

import type React from "react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import {
  brandFormSchema, type BrandFormSchema,} from "@/lib/schemas/brands.schemas";
import type {  BrandFormProps } from "@/types/brands.types";

export function BrandForm({ brand, isEdit = false }: BrandFormProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<BrandFormSchema>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      name: brand?.name || "",
      description: brand?.description || "",
      icon: brand?.icon || "",
      isActive: brand?.isActive || true,
    },
  });

  const handleFileUpload = async (file: File): Promise<void> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<{ url: string }>(
        "/api/admin/upload-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        form.setValue("icon", response.data.url);
        toast({
          title: "Success",
          description: "Icon uploaded successfully",
        });
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : "Failed to upload icon";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: BrandFormSchema): Promise<void> => {
    try {
      const url = isEdit ? `/api/admin/brands/${brand?._id}` : "/api/admin/brands";
      const method = isEdit ? "put" : "post";

      const response = await axios<BrandFormSchema>({
        method,
        url,
        data,
      });

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Success",
          description: `Brand ${isEdit ? "updated" : "created"} successfully`,
        });
        router.push("/admin/brands");
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : `Failed to ${isEdit ? "update" : "create"} brand`;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const iconUrl = form.watch("icon");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Brand" : "Create New Brand"}</CardTitle>
        <CardDescription>
          {isEdit ? "Update brand information" : "Add a new brand to your store"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Brand Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Brand Name</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="Enter brand name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="description">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      placeholder="Enter brand description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand Icon Field */}
            <FormField
              control={form.control}
              name="icon"
              render={() => (
                <FormItem>
                  <FormLabel>Brand Icon</FormLabel>
                  <div className="flex items-center gap-4">
                    {iconUrl ? (
                      <div className="relative">
                        <Image
                          src={iconUrl || "/placeholder.svg"}
                          alt="Brand logo"
                          width={64}
                          height={64}
                          className="rounded-md border object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => form.setValue("icon", "")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                        <Upload className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Upload Icon"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </div>
                  </div>
                  {form.formState.errors.icon && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.icon.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Active Status Field */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        id="isActive"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel htmlFor="isActive">Active</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || uploading}
              >
                {form.formState.isSubmitting ? "Saving..." : isEdit ? "Update Brand" : "Create Brand"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/brands")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
