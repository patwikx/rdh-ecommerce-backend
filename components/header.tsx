'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { LogOut, Package, Settings, CreditCard, Bell, Shield, Star, User } from 'lucide-react'
import { useCurrentUser } from '@/lib/auth'

export function Headerx() {
  const user = useCurrentUser()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
    router.push('/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-full"
        >
          <Avatar className="h-9 w-9">
            {user?.image ? (
              <AvatarImage 
                src={user.image} 
                alt={user?.name || ''} 
                className="object-cover"
              />
            ) : (
              <AvatarFallback>
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-[280px] p-0"
        sideOffset={5}
      >
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {user?.image ? (
                <AvatarImage 
                  src={user.image} 
                  alt={user?.name || ''} 
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="text-lg">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-base font-semibold leading-none">
                {user?.name || 'User'}
              </h3>
              <p className="text-sm text-muted-foreground truncate max-w-[160px]">
                {user?.email || 'user@example.com'}
              </p>
              <Badge variant="secondary" className="mt-1">
                Administrator
              </Badge>
            </div>
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="grid grid-cols-2 gap-0.5">
          <DropdownMenuItem 
            onClick={() => router.push("/my-orders")}
            className="flex flex-col items-center gap-2 p-4 focus:bg-accent"
          >
            <Package className="h-5 w-5" />
            <span className="text-xs">My Orders</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => router.push("/settings")}
            className="flex flex-col items-center gap-2 p-4 focus:bg-accent"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => router.push("/billing")}
            className="flex flex-col items-center gap-2 p-4 focus:bg-accent"
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-xs">Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => router.push("/notifications")}
            className="flex flex-col items-center gap-2 p-4 focus:bg-accent"
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs">Notifications</span>
          </DropdownMenuItem>
        </div>
        <div className="h-px bg-border" />
        <div className="p-2">
          <DropdownMenuItem 
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md p-2 text-red-500 focus:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Headerx