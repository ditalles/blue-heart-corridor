"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, LogOut, LayoutDashboard, Building2, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User as UserType } from "@/types";

interface NavbarProps {
  user: UserType | null;
}

export function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">BalkanHostels</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/hostels" className="text-sm font-medium hover:text-primary transition-colors">
            Find Hostels
          </Link>
          <Link href="/HR" className="text-sm font-medium hover:text-primary transition-colors">
            Croatia
          </Link>
          <Link href="/RS" className="text-sm font-medium hover:text-primary transition-colors">
            Serbia
          </Link>
          <Link href="/AL" className="text-sm font-medium hover:text-primary transition-colors">
            Albania
          </Link>
          <Link href="/ME" className="text-sm font-medium hover:text-primary transition-colors">
            Montenegro
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full focus:outline-none">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                {(user.role === "owner" || user.role === "admin") && (
                  <DropdownMenuItem onClick={() => router.push("/manage/hostels")}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Manage Hostels
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="md:hidden p-2">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/hostels" className="text-lg font-medium" onClick={() => setOpen(false)}>
                  Find Hostels
                </Link>
                <Link href="/HR" className="text-lg font-medium" onClick={() => setOpen(false)}>
                  Croatia
                </Link>
                <Link href="/RS" className="text-lg font-medium" onClick={() => setOpen(false)}>
                  Serbia
                </Link>
                <Link href="/AL" className="text-lg font-medium" onClick={() => setOpen(false)}>
                  Albania
                </Link>
                <Link href="/ME" className="text-lg font-medium" onClick={() => setOpen(false)}>
                  Montenegro
                </Link>
                <div className="border-t pt-4 mt-4">
                  {!user && (
                    <>
                      <Link href="/auth/login" onClick={() => setOpen(false)} className="block py-2 text-lg font-medium">
                        Log In
                      </Link>
                      <Link href="/auth/register" onClick={() => setOpen(false)} className="block py-2 text-lg font-medium text-primary">
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
