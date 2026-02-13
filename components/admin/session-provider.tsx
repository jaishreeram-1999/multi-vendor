"use client"

import type React from "react"
import { SessionProvider } from "next-auth/react"
import { Suspense } from "react"

export default function NextAuthSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={null}>  
      <SessionProvider>
        {children}
      </SessionProvider>
    </Suspense>
  )
}