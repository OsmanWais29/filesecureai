import { useState } from "react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import {
  File,
  FileUp,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/mode-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SidebarNavItem } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems?: SidebarNavItem[]
}

export function MainLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen)
  }

  const navItems = [
    {
      label: "Home",
      icon: <Home className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      label: "Activity",
      icon: <File className="h-5 w-5" />,
      href: "/activity",
    },
    {
      label: "Converter",
      icon: <FileUp className="h-5 w-5" />,
      href: "/converter",
    },
  ];

  return (
    <div className="flex h-screen antialiased text-foreground">
      <aside className="relative z-20 flex flex-col flex-shrink-0 hidden w-64 border-r md:block bg-background">
        <div className="flex flex-col h-full px-3 py-4">
          <a className="flex items-center justify-center py-3" href="#">
            <div className="relative">
              <Avatar className="w-9 h-9">
                <AvatarImage src="https://avatars.githubusercontent.com/u/8435791?v=4" />
                <AvatarFallback>TT</AvatarFallback>
              </Avatar>
            </div>
          </a>
          <Separator className="my-2 space-y-1" />
          <ScrollArea className="flex-1 space-y-1">
            <div className="space-y-1">
              {navItems?.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push(item.href)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
          <Separator className="my-2 space-y-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <User className="w-4 h-4 mr-2" />
                <span className="truncate">My Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                <span>Profile</span>
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                <span>Settings</span>
                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Log out</span>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="md:hidden"
            onClick={toggleSidebar}
          >
            Open Nav
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="z-20 flex w-64 flex-col border-r md:hidden"
        >
          <SheetHeader className="px-5 pt-5 pb-4">
            <SheetTitle>Dashboard</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full px-3 py-4">
            <a className="flex items-center justify-center py-3" href="#">
              <div className="relative">
                <Avatar className="w-9 h-9">
                  <AvatarImage src="https://avatars.githubusercontent.com/u/8435791?v=4" />
                  <AvatarFallback>TT</AvatarFallback>
                </Avatar>
              </div>
            </a>
            <Separator className="my-2 space-y-1" />
            <ScrollArea className="flex-1 space-y-1">
              <div className="space-y-1">
                {navItems?.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => router.push(item.href)}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <Separator className="my-2 space-y-1" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  <span className="truncate">My Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  <span>Profile</span>
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Log out</span>
                  <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SheetContent>
      </Sheet>
      <main className="flex flex-col flex-1 w-full">
        <header className="z-10 py-2 border-b">
          <div className="flex items-center justify-between px-4">
            <Label htmlFor="search">
              <span className="sr-only">Search</span>
            </Label>
            <Input
              id="search"
              placeholder="Search..."
              type="search"
              className="max-w-sm lg:block"
            />
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  )
}
