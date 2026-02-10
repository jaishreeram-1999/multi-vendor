"use client";

import Link from "next/link";
import {
  LogOut,
  MoveUpRight,
  Settings,
  CreditCard,
  FileText,
} from "lucide-react";

// shadcn/ui components
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}

interface ProfileProps {
  name?: string;
  role?: string;
  avatar?: string;
  subscription?: string;
}

// Default profile values (fallback)
const defaultProfile = {
  name: "Alex Watson",
  role: "Prompt Engineer",
  avatar:
    "https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-02-albo9B0tWOSLXCVZh9rX9KFxXIVWMr.png",
  subscription: "Free Trial",
} as const;

export default function Profile({
  name,
  role,
  avatar,
  subscription,
}: ProfileProps) {
  // Use provided props or fall back to defaults
  const profileName = name || defaultProfile.name;
  const profileRole = role || defaultProfile.role;
  const profileAvatar = avatar || defaultProfile.avatar;
  const profileSubscription = subscription || defaultProfile.subscription;

  // Menu items configuration
  const menuItems: MenuItem[] = [
    {
      label: "Subscription",
      value: profileSubscription,
      href: "#",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      label: "Terms & Policies",
      href: "#",
      icon: <FileText className="h-4 w-4" />,
      external: true,
    },
  ];

  return (
    <Card className="w-full max-w-sm mx-auto border shadow-sm">
      <CardContent className="p-6">
        {/* Profile header with avatar and name */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={profileAvatar} alt={profileName} />
            <AvatarFallback>{profileName.slice(0, 2)}</AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {profileName}
            </h2>
            <p className="text-sm text-muted-foreground">{profileRole}</p>
          </div>
        </div>

        <Separator className="my-5" />

        {/* Menu items */}
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              asChild
              className="w-full justify-between h-auto py-2.5 px-3 text-left font-normal hover:bg-accent/50"
            >
              <Link
                href={item.href}
                target={item.external ? "_blank" : undefined}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  {item.value && <span className="text-xs">{item.value}</span>}
                  {item.external && <MoveUpRight className="h-3.5 w-3.5" />}
                </div>
              </Link>
            </Button>
          ))}

          {/* Logout button */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-2.5 px-3 text-left font-normal text-destructive hover:text-destructive hover:bg-destructive/10 mt-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
