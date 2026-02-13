"use client";

import type React from "react";
import {
  Package,
  Settings,
  HelpCircle,
  ChevronDown,
  BarChart2,
  MessageSquare,
  Plus,
  BookOpen,
  LayoutGridIcon,
  AlignJustify,
  ShoppingCart,
  FolderTree,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// ───────────────────────────────────────────────
// Extend Window interface globally (best practice)
declare global {
  interface Window {
    toggleMenuState?: () => void;
    menuState?: MenuState;
    isHovered?: boolean;
    isMobile?: boolean;
    isMobileMenuOpen?: boolean;
    setIsMobileMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    setMenuStateFromCustomizer?: (state: MenuState) => void;
  }
}

// ───────────────────────────────────────────────
type MenuState = "full" | "collapsed" | "hidden";

interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  isNew?: boolean;
  children?: SubMenuItem[];
}

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isNew?: boolean;
  children?: SubMenuItem[];
}

interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
}

// ───────────────────────────────────────────────
// You can expand this menu data later
const menuData: MenuSection[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: Package,
        children: [
          {
            id: "overview",
            label: "Overview",
            href: "/dashboard/overview",
            icon: BarChart2,
          },
        ],
      },
    ],
  },

  {
    id: "ecommerce",
    label: "E-commerce",
    items: [
      {
        id: "products",
        label: "Products",
        href: "/products",
        icon: ShoppingCart,
        children: [
          {
            id: "all-products",
            label: "All Products",
            href: "/admin/products/",
            icon: AlignJustify,
          },
        ],
      },
      
      {
        id: "categories",
        label: "Categories",
        icon: FolderTree,
        children: [
          {
            id: "all-categories",
            label: "All Categories",
            href: "/admin/categories/",
            icon: AlignJustify,
          },
          {
            id: "add-new-category",
            label: "Add New Category",
            href: "/admin/categories/add",
            icon: Plus,
          },
        ],
      },

      
    ],
  },

  {
    id: "blog",
    label: "Blog",
    items: [
      {
        id: "blogs",
        label: "Blogs",
        href: "/admin/blog",
        icon: BookOpen,
        children: [
          {
            id: "all-blogs",
            label: "All Blog",
            href: "/admin/blog",
            icon: AlignJustify,
          },
          {
            id: "add-blog",
            label: "Add Blog",
            href: "/admin/blog/add",
            icon: Plus,
          },
        ],
      },
      {
        id: "blogcategories",
        label: "Blogs Category",
        icon: LayoutGridIcon,
        children: [
          {
            id: "blogcategories",
            label: "All Category",
            href: "/admin/blog/categories",
            icon: AlignJustify,
          },
          {
            id: "blogcategories",
            label: "Add Category",
            href: "/admin/blog/categories/add",
            icon: Plus,
          },
        ],
      },
      {
        id: "blog-reviews",
        label: "Blog Reviews",

        icon: MessageSquare,
        children: [
          {
            id: "all-blog-reviews",
            label: "All Review",
            href: "/admin/blog/reviews",
            icon: AlignJustify,
          },
          {
            id: "new-blog-reviews",
            label: "Add New Review",
            href: "/admin/blog/reviews/add",
            icon: Plus,
          },
        ],
      },
    ],
  },
];

// ───────────────────────────────────────────────
export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuState, setMenuState] = useState<MenuState>("full");
  const [isHovered, setIsHovered] = useState(false);
  const [previousDesktopState, setPreviousDesktopState] =
    useState<MenuState>("full");
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Cycle through menu states: full → collapsed → hidden → full
  const toggleMenuState = () => {
    setMenuState((prev) => {
      switch (prev) {
        case "full":
          return "collapsed";
        case "collapsed":
          return "hidden";
        case "hidden":
          return "full";
        default:
          return "full";
      }
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setMenuStateFromCustomizer = (state: MenuState) => {
    if (!isMobile) {
      setMenuState(state);
    }
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      const nowMobile = !isDesktop;

      setIsMobile(nowMobile);

      if (nowMobile) {
        // Going to mobile → hide sidebar & remember state
        if (menuState !== "hidden") {
          setPreviousDesktopState(menuState);
          setMenuState("hidden");
        }
      } else {
        // Going back to desktop → restore previous state
        if (menuState === "hidden" && previousDesktopState !== "hidden") {
          setMenuState(previousDesktopState);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuState, previousDesktopState]);

  // Expose states & functions to window (for TopNav, ThemeCustomizer, etc.)
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.toggleMenuState = toggleMenuState;
    window.menuState = menuState;
    window.isHovered = isHovered;
    window.isMobile = isMobile;
    window.isMobileMenuOpen = isMobileMenuOpen;
    window.setIsMobileMenuOpen = setIsMobileMenuOpen;
    window.setMenuStateFromCustomizer = setMenuStateFromCustomizer;

    // Optional: cleanup when unmount (good practice)
    return () => {
      delete window.toggleMenuState;
      delete window.menuState;
      delete window.isHovered;
      delete window.isMobile;
      delete window.isMobileMenuOpen;
      delete window.setIsMobileMenuOpen;
      delete window.setMenuStateFromCustomizer;
    };
  }, [
    menuState,
    isHovered,
    isMobile,
    isMobileMenuOpen,
    setMenuStateFromCustomizer,
  ]);

  const handleNavigation = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  type NavItemProps = {
    item: MenuItem | SubMenuItem;
    level?: number;
    parentId?: string;
  };

  function NavItem({ item, level = 0, parentId = "" }: NavItemProps) {
    const itemId = `${parentId}-${item.id}`;
    const isExpanded = expandedItems.has(itemId);
    const hasChildren = !!item.children?.length;
    const showText =
      menuState === "full" ||
      (menuState === "collapsed" && isHovered) ||
      (isMobile && isMobileMenuOpen);
    const showExpandIcon = hasChildren && showText;

    const paddingLeft =
      level === 0 ? "px-3" : level === 1 ? "pl-8 pr-3" : "pl-12 pr-3";

    const Icon = item.icon;

    const content = (
      <div
        className={cn(
          "flex items-center py-2 text-sm rounded-md transition-colors sidebar-menu-item hover:bg-gray-50 dark:hover:bg-[#1F1F23] relative group cursor-pointer",
          paddingLeft,
        )}
        onClick={() => {
          if (hasChildren) {
            toggleExpanded(itemId);
          } else if (item.href) {
            window.location.href = item.href;
            handleNavigation();
          }
        }}
        title={
          menuState === "collapsed" && !isHovered && !isMobile
            ? item.label
            : undefined
        }
      >
        {Icon && <Icon className="h-4 w-4 shrink-0 sidebar-menu-icon" />}

        {showText && (
          <>
            <span className="ml-3 flex-1 transition-opacity duration-200 sidebar-menu-text">
              {item.label}
            </span>

            <div className="flex items-center space-x-1">
              {item.isNew && (
                <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  New
                </span>
              )}
              {item.badge && (
                <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                  {item.badge}
                </span>
              )}
              {showExpandIcon && (
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    isExpanded ? "rotate-180" : "rotate-0",
                  )}
                />
              )}
            </div>
          </>
        )}

        {menuState === "collapsed" && !isHovered && !isMobile && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {item.label}
            {item.badge && (
              <span className="ml-1 text-blue-300">({item.badge})</span>
            )}
          </div>
        )}
      </div>
    );

    return (
      <div>
        {item.href && !hasChildren ? (
          <Link href={item.href}>{content}</Link>
        ) : (
          content
        )}

        {hasChildren && isExpanded && showText && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                level={level + 1}
                parentId={itemId}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const getSidebarWidth = () => {
    if (isMobile) return "w-64";
    if (menuState === "collapsed" && isHovered) return "w-64";
    return menuState === "collapsed" ? "w-16" : "w-64";
  };

  const showText =
    menuState === "full" ||
    (menuState === "collapsed" && isHovered) ||
    (isMobile && isMobileMenuOpen);

  // ───────────────────────────────────────────────
  // Mobile view (overlay)
  if (isMobile) {
    return (
      <>
        <nav
          className={cn(
            "fixed inset-y-0 left-0 z-70 w-64 bg-white dark:bg-[#0F0F12] border-r border-gray-200 dark:border-[#1F1F23] transform transition-transform duration-300 ease-in-out",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="h-full flex flex-col">
            <div className="h-16 px-3 flex items-center border-b border-gray-200 dark:border-[#1F1F23]">
              <Link
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full"
              >
                <Image
                  src="/logo.jpg"
                  alt="Admin"
                  width={32}
                  height={32}
                  className="shrink-0"
                />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin
                </span>
              </Link>
            </div>

            <div
              className="flex-1 overflow-y-auto py-4 px-2 scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="space-y-6">
                {menuData.map((section) => (
                  <div key={section.id}>
                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {section.label}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <NavItem
                          key={item.id}
                          item={item}
                          parentId={section.id}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-2 py-4 border-t border-gray-200 dark:border-[#1F1F23]">
              <div className="space-y-1">
                <NavItem
                  item={{
                    id: "settings",
                    label: "Settings",
                    href: "/settings",
                    icon: Settings,
                  }}
                />
                <NavItem
                  item={{
                    id: "help",
                    label: "Help",
                    href: "/help",
                    icon: HelpCircle,
                  }}
                />
              </div>
            </div>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-65"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </>
    );
  }

  // ───────────────────────────────────────────────
  // Desktop sidebar
  return (
    <nav
      className={cn(
        "fixed inset-y-0 left-0 z-60 bg-white dark:bg-[#0F0F12] border-r border-gray-200 dark:border-[#1F1F23] transition-all duration-300 ease-in-out",
        menuState === "hidden" ? "w-0 border-r-0" : getSidebarWidth(),
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        overflow: menuState === "hidden" ? "hidden" : "visible",
      }}
    >
      {menuState !== "hidden" && (
        <div className="h-full flex flex-col">
          <div className="h-16 px-3 flex items-center border-b border-gray-200 dark:border-[#1F1F23]">
            {showText ? (
              <Link
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full"
              >
                <Image
                  src="/logo.jpg"
                  alt="Admin"
                  width={32}
                  height={32}
                  className="shrink-0"
                />
                <span className="text-lg font-semibold text-gray-900 dark:text-white transition-opacity duration-200">
                  Dashboard
                </span>
              </Link>
            ) : (
              <div className="flex justify-center w-full">
                <Image
                  src="/logo.jpg"
                  alt="Admin"
                  width={32}
                  height={32}
                  className="shrink-0"
                />
              </div>
            )}
          </div>

          <div
            className="flex-1 overflow-y-auto py-4 px-2 scrollbar-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <div className="space-y-6">
              {menuData.map((section) => (
                <div key={section.id}>
                  {showText && (
                    <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 transition-opacity duration-200">
                      {section.label}
                    </div>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavItem
                        key={item.id}
                        item={item}
                        parentId={section.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-2 py-4 border-t border-gray-200 dark:border-[#1F1F23]">
            <div className="space-y-1">
              <NavItem
                item={{
                  id: "settings",
                  label: "Settings",
                  href: "/settings",
                  icon: Settings,
                }}
              />
              <NavItem
                item={{
                  id: "help",
                  label: "Help",
                  href: "/help",
                  icon: HelpCircle,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
