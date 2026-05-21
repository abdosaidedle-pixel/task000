import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetAdminMe, useAdminLogout } from "@workspace/api-client-react";
import { LayoutDashboard, Package, ShoppingBag, Image as ImageIcon, Tags, LogOut, Menu, X, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: admin, isLoading, error } = useGetAdminMe({
    query: {
      retry: false,
    }
  });
  
  const logout = useAdminLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (error || !admin)) {
      setLocation("/admin");
    }
  }, [admin, isLoading, error, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">جاري التحميل...</div>;
  }

  if (!admin) {
    return null; // Will redirect
  }

  const handleLogout = () => {
    localStorage.removeItem("adam_admin_token");
    logout.mutate(undefined, {
      onSuccess: () => {
        setLocation("/admin");
      }
    });
  };

  const navLinks = [
    { name: "لوحة التحكم", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "الطلبات", path: "/admin/orders", icon: ShoppingBag },
    { name: "المنتجات", path: "/admin/products", icon: Package },
    { name: "الأقسام", path: "/admin/categories", icon: Tags },
    { name: "اللافتات", path: "/admin/banners", icon: ImageIcon },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-primary-foreground group">
          <div className="p-2 bg-white/10 rounded-full group-hover:bg-secondary/20 transition-colors">
            <Leaf className="w-6 h-6 text-secondary" />
          </div>
          <span className="font-sans font-bold text-2xl tracking-tight">
            عطارة آدم
          </span>
        </Link>
        <div className="mt-4 px-3 py-1 bg-white/10 rounded-full inline-block text-xs font-medium text-secondary">
          لوحة الإدارة
        </div>
      </div>
      
      <div className="flex-1 px-4 space-y-2 mt-4">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-secondary text-secondary-foreground shadow-md font-bold" 
                  : "text-primary-foreground/80 hover:bg-white/10 hover:text-white font-medium"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-secondary-foreground" : "text-primary-foreground/60 group-hover:text-white")} />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-primary-foreground/80 hover:text-white hover:bg-white/10 rounded-xl"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          <LogOut className="w-5 h-5" />
          {logout.isPending ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-primary-foreground shrink-0 shadow-xl z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-primary text-primary-foreground flex items-center justify-between px-4 z-30 shadow-md">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-secondary" />
          <span className="font-bold text-lg">إدارة عطارة آدم</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-primary z-20 flex flex-col">
          <SidebarContent />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:pt-0 pt-16 h-screen overflow-hidden">
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
