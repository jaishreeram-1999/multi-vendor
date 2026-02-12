
// "use client";
// import { ReactNode } from "react";
// import { Toaster } from "@/components/ui/toaster"; // jo toaster component tumhare toast system me hai
// import { useToast } from "@/hooks/use-toast";

// export function ToastProvider({ children }: { children: ReactNode }) {
//   const toast = useToast();

//   return (
//     <>
//       {children}
//       <Toaster toasts={toast.toasts} /> {/* Ye popup messages show karega */}
//     </>
//   );
// }



"use client";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster"; // jo toaster component tumhare toast system me hai


export function ToastProvider({ children }: { children: ReactNode }) {
  
  return (
    <>
      {children}
      <Toaster  /> 
    </>
  );
}
