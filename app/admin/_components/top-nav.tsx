"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Search,
  Settings,
  User,
  ChevronDown,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom window type for menu toggling
interface CustomWindowProps {
  toggleMenuState?: () => void;
  setIsMobileMenuOpen?: (state: boolean) => void;
  isMobileMenuOpen?: boolean;
}

interface MyUser {
  name: string
  email: string
  role?: string
}

export default function TopNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  /* -------------------- Profile Info -------------------- */

  const profileName = session?.user?.name || "John Doe";
  const profileRole = (session?.user as MyUser)?.role || "Administrator";
  const profileAvatar =
    "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-02-albo9B0tWOSLXCVZh9rX9KFxXIVWMr.png";

  /* -------------------- Breadcrumb Logic -------------------- */

  // Remove query params & split path
  const segments = pathname
    .split("?")[0]
    .split("/")
    .filter((segment) => segment && !/^\d+$/.test(segment)); // removes numeric IDs

  // Format labels nicely
  const formatLabel = (segment: string) =>
    segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  // Custom mapping (recommended for production apps)
  const routeNameMap: Record<string, string> = {
    dashboard: "Dashboard",
    admin: "Admin",
    users: "Users",
    settings: "Settings",
    profile: "Profile",
  };

  /* -------------------- Menu Handlers -------------------- */

  const handleMenuToggle = () => {
    if (typeof window !== "undefined") {
      const customWindow = window as unknown as CustomWindowProps;
      customWindow.toggleMenuState?.();
    }
  };

  const handleMobileMenuToggle = () => {
    if (typeof window !== "undefined") {
      const customWindow = window as unknown as CustomWindowProps;
      customWindow.setIsMobileMenuOpen?.(!customWindow.isMobileMenuOpen);
    }
  };

  /* -------------------- Component -------------------- */

  return (
    <div className="flex items-center justify-between h-full px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMenuToggle}
          className="hidden lg:flex p-2"
          title="Toggle Menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleMobileMenuToggle}
          className="lg:hidden p-2"
          title="Toggle Mobile Menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* ✅ Dynamic Breadcrumb */}
        <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <Link
            href="/dashboard"
            className="flex items-center hover:text-gray-900 dark:hover:text-white"
          >
            <Home className="h-4 w-4 mr-1" />
            Dashboard
          </Link>

          {segments.slice(1).map((segment, index) => {
            const href = "/" + segments.slice(0, index + 2).join("/");
            const isLast = index === segments.slice(1).length - 1;

            return (
              <span key={href} className="flex items-center space-x-2">
                <span>/</span>
                {isLast ? (
                  <span className="text-gray-900 dark:text-white font-medium">
                    {routeNameMap[segment] || formatLabel(segment)}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    {routeNameMap[segment] || formatLabel(segment)}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="md:hidden p-2">
          <Search className="h-4 w-4" />
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 p-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profileAvatar} alt={profileName} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>

              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {profileName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {profileRole}
                </span>
              </div>

              <ChevronDown className="hidden lg:block h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-600"
              onClick={() => signOut()}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
