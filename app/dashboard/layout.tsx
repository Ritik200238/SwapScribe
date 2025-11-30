"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/plans",
      label: "Plans",
      icon: CreditCard,
      active: pathname.startsWith("/dashboard/plans"),
    },
    {
      href: "/dashboard/subscribers",
      label: "Subscribers",
      icon: Users,
      active: pathname.startsWith("/dashboard/subscribers"),
    },
    {
      href: "/dashboard/invoices",
      label: "Invoices",
      icon: FileText,
      active: pathname.startsWith("/dashboard/invoices"),
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      active: pathname.startsWith("/dashboard/settings"),
    },
  ];

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b p-4 md:hidden">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Image 
            src="/logo.png" 
            alt="SwapScribe" 
            width={24} 
            height={24} 
            className="rounded-sm"
          />
          SwapScribe
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="border-b p-6 flex items-center gap-2">
                <Image 
                  src="/logo.png" 
                  alt="SwapScribe" 
                  width={24} 
                  height={24} 
                  className="rounded-sm"
                />
                <h2 className="text-lg font-semibold">SwapScribe</h2>
              </div>
              <nav className="flex-1 space-y-1 p-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      route.active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <route.icon className="mr-3 h-5 w-5" />
                    {route.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t p-4 space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <Link href="mailto:support@swapscribe.io">
                    <HelpCircle className="mr-3 h-5 w-5" />
                    Support
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="p-6 border-b flex items-center gap-2">
          <Image 
            src="/logo.png" 
            alt="SwapScribe" 
            width={32} 
            height={32} 
            className="rounded-sm"
          />
          <h1 className="text-xl font-bold tracking-tight">SwapScribe</h1>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                route.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <route.icon className="mr-3 h-5 w-5" />
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4 space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="mailto:support@swapscribe.io">
              <HelpCircle className="mr-3 h-5 w-5" />
              Support
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}