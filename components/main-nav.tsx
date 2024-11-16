"use client";

import Link from "next/link"
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, ChevronDown, Home, Image, FolderTree, Package, ShoppingCart, Settings, Ruler, Palette, Scale, FileText, User } from 'lucide-react';

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const params = useParams();
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSystemOpen, setIsSystemOpen] = useState(false);

  const routes = [
    {
      href: `/${params.storeId}`,
      label: 'Overview',
      icon: Home,
      active: pathname === `/${params.storeId}`,
    },
    {
      href: `/${params.storeId}/billboards`,
      label: 'Billboards',
      icon: Image,
      active: pathname === `/${params.storeId}/billboards`,
    },

    {
      href: `/${params.storeId}/products`,
      label: 'Products',
      icon: Package,
      active: pathname === `/${params.storeId}/products`,
    },
    {
      href: `/${params.storeId}/orders`,
      label: 'Orders',
      icon: ShoppingCart,
      active: pathname === `/${params.storeId}/orders`,
    },
    
  ]

  const systemRoutes = [
    {
      href: `/${params.storeId}/user-management`,
      label: 'User Management',
      icon: User,
      description: "Manage user accounts.",
      active: pathname === `/${params.storeId}/user-management`,
    },
    {
      href: `/${params.storeId}/settings`,
      label: 'Settings',
      icon: Settings,
      description: "Manage website settings.",
      active: pathname === `/${params.storeId}/settings`,
    },
  ]

  const catalogRoutes = [
    {
      href: `/${params.storeId}/categories`,
      label: 'Categories',
      icon: FolderTree,
      description: "Product categories",
      active: pathname === `/${params.storeId}/categories`,
    },
    {
      href: `/${params.storeId}/sizes`,
      label: 'Sizes',
      icon: Ruler,
      description: 'Manage product sizes',
      active: pathname === `/${params.storeId}/sizes`,
    },
    {
      href: `/${params.storeId}/colors`,
      label: 'Colors',
      icon: Palette,
      description: 'Manage product colors',
      active: pathname === `/${params.storeId}/colors`,
    },
    {
      href: `/${params.storeId}/uom`,
      label: 'UoM',
      icon: Scale,
      description: 'Units of measurement',
      active: pathname === `/${params.storeId}/uom`,
    },
  ]

  return (
    <nav
      className={cn("flex items-center space-x-1 lg:space-x-2", className)}
      {...props}
    >
      {routes.map((route) => {
        const Icon = route.icon;
        return (
          <Link
            key={route.href}
            href={route.href}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all',
                'hover:bg-accent/50 hover:shadow-sm',
                route.active 
                  ? 'bg-accent/60 text-accent-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4 mr-2" />
              {route.label}
            </motion.div>
          </Link>
        );
      })}
      <DropdownMenu open={isCatalogOpen} onOpenChange={setIsCatalogOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={catalogRoutes.some(route => route.active) ? "secondary" : "ghost"} 
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium transition-all",
              "hover:bg-accent/50 hover:shadow-sm",
              catalogRoutes.some(route => route.active) 
                ? 'bg-accent/60 text-accent-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-accent-foreground'
            )}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Product Management
            <motion.div
              animate={{ rotate: isCatalogOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2 inline-block"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[220px] p-2"
          sideOffset={8}
        >
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Product Management
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {catalogRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <DropdownMenuItem key={route.href} asChild>
                <Link href={route.href} className="w-full">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex flex-col w-full rounded-md p-2 transition-all',
                      'hover:bg-accent/50',
                      route.active 
                        ? 'bg-accent/60 text-accent-foreground' 
                        : 'text-muted-foreground hover:text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="font-medium">{route.label}</span>
                    </div>
                    <span className="ml-6 text-xs text-muted-foreground">
                      {route.description}
                    </span>
                  </motion.div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu open={isSystemOpen} onOpenChange={setIsSystemOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={systemRoutes.some(route => route.active) ? "secondary" : "ghost"} 
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium transition-all",
              "hover:bg-accent/50 hover:shadow-sm",
              systemRoutes.some(route => route.active) 
                ? 'bg-accent/60 text-accent-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-accent-foreground'
            )}
          >
            <Settings className="w-4 h-4 mr-2" />
            System Settings
            <motion.div
              animate={{ rotate: isSystemOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="ml-2 inline-block"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-[220px] p-2"
          sideOffset={8}
        >
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            System Management
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {systemRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <DropdownMenuItem key={route.href} asChild>
                <Link href={route.href} className="w-full">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex flex-col w-full rounded-md p-2 transition-all',
                      'hover:bg-accent/50',
                      route.active 
                        ? 'bg-accent/60 text-accent-foreground' 
                        : 'text-muted-foreground hover:text-accent-foreground'
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      <span className="font-medium">{route.label}</span>
                    </div>
                    <span className="ml-6 text-xs text-muted-foreground">
                      {route.description}
                    </span>
                  </motion.div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}