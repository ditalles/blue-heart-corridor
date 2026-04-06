import { Navbar } from "@/components/layout/navbar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Calendar, Users, MessageSquare, BarChart3 } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  const navItems = [
    { href: "/admin/hostels", label: "Hostels", icon: Building2 },
    { href: "/admin/bookings", label: "Bookings", icon: Calendar },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  ];

  return (
    <>
      <Navbar user={profile} />
      <div className="flex min-h-[calc(100vh-64px)]">
        <aside className="w-56 border-r bg-muted/30 p-4 hidden md:block">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Admin Panel
          </p>
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </>
  );
}
