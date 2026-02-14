"use client";

import type React from "react";
import { useCallback } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type ControllerRenderProps, // Add this
  type ControllerFieldState,  // Add this
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormMessage, FormItem, FormLabel, FormControl } from "@/components/ui/form";

interface BrandInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}

export function BrandInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "",
  type = "text",
  disabled = false,
  required = false,
}: BrandInputProps<T>) {
  // Yahan Types define karein:
  const renderInput = useCallback(
    ({ 
      field, 
      fieldState 
    }: { 
      field: ControllerRenderProps<T, Path<T>>; 
      fieldState: ControllerFieldState; 
    }) => (
      <FormItem>
        <FormLabel htmlFor={name}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </FormLabel>
        <FormControl>
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            {...field}
            // Ensure value is never undefined for controlled inputs
            value={field.value ?? ""} 
          />
        </FormControl>
        {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
      </FormItem>
    ),
    [name, label, placeholder, type, disabled, required]
  );

  return (
    <Controller
      control={control}
      name={name}
      render={renderInput}
    />
  );
}