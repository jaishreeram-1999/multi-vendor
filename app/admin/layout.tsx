"use client"

import type { ReactNode } from "react"
import Sidebar from "./_components/sidebar"
import TopNav from "./_components/top-nav"
import { useEffect, useState } from "react"


type MenuState = "full" | "collapsed" | "hidden"

interface CustomWindow extends Window {
  menuState?: MenuState
  isHovered?: boolean
  isMobile?: boolean
}

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {

  const [menuState, setMenuState] = useState<"full" | "collapsed" | "hidden">("full")
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

useEffect(() => {
  const checkMenuState = () => {
    if (typeof window !== "undefined") {

      const customWindow = window as CustomWindow  // 👈 YAHAN

      if (customWindow.menuState) {
        setMenuState(customWindow.menuState)
      }

      if (customWindow.isHovered !== undefined) {
        setIsHovered(customWindow.isHovered)
      }

      if (customWindow.isMobile !== undefined) {
        setIsMobile(customWindow.isMobile)
      }
    }
  }

  checkMenuState()
  const interval = setInterval(checkMenuState, 50)

  return () => clearInterval(interval)
}, [])

  // Calculate margin based on menu state and hover - only for desktop
  const getMarginLeft = () => {
    if (isMobile) {
      return "0" // No margin on mobile, sidebar is overlay
    }
    if (menuState === "hidden") {
      return "0"
    }
    // If collapsed and hovered, expand temporarily
    if (menuState === "collapsed" && isHovered) {
      return "16rem" // 256px - full width
    }
    if (menuState === "collapsed") {
      return "4rem" // 64px - collapsed width
    }
    return "16rem" // 256px - full width
  }

  return (
    <div className={`flex h-screen `}>
      <Sidebar />
      <div
        className="w-full flex flex-1 flex-col transition-all duration-300 ease-in-out min-w-0"
        style={{
          marginLeft: getMarginLeft(),
        }}
      >
        <header className="h-16 border-b border-gray-200 dark:border-[#1F1F23] shrink-0">
          <TopNav />
        </header>
        <main className="flex-1 p-3 sm:p-6 bg-white dark:bg-[#0F0F12] min-w-0">{children}</main>
      </div>


    </div>
  )
}
