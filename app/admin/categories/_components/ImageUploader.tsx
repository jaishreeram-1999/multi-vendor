"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Loader2, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  value: string;
  onValueChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUploader({
  value,
  onValueChange,
  disabled,
}: ImageUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      if (data.success && data.url) {
        onValueChange(data.url);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onValueChange("");
              setPreviewError(false);
            }}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
        aria-label="Upload image"
      />

{value && !previewError && (
  <div 
    className="
      relative 
      w-full 
      max-w-md               // ← cap width
      mx-auto                // ← center it nicely
      aspect-square 
      border border-border 
      rounded-xl 
      overflow-hidden 
      bg-gradient-to-br from-muted/30 to-muted/10 
      shadow-md
    "
  >
    <Image
      src={value}
      alt="Category image preview – full view"
      fill
      className="object-contain p-2"  // progressive padding
      onError={() => setPreviewError(true)}
      // Better sizes strategy:
      sizes="
        (max-width: 480px) 100vw,
        (max-width: 768px) 90vw,
        (max-width: 1024px) 60vw,
        448px
      "
      // Optional: better quality on larger screens
      quality={95}
    />
  </div>
)}

      {value && previewError && (
        <div className="w-64 h-64 border rounded-lg flex items-center justify-center bg-muted text-sm text-muted-foreground">
          Image URL: {value.slice(0, 20)}...
        </div>
      )}
    </div>
  );
}
