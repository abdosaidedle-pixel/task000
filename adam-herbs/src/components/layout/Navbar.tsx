import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", path: "/" },
    { name: "المنتجات", path: "/products" },
    { name: "الأقسام", path: "/products" },
    { name: "تواصل معنا", path: "/contact" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-[#2F4F3A]/95 backdrop-blur-md shadow-lg border-[#C9A14A]/20"
          : "bg-[#2F4F3A]/90 backdrop-blur-sm border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-[#C9A14A] flex items-center justify-center font-black text-[#2F4F3A] text-xl group-hover:shadow-lg transition-all">
              ع
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-black text-[#C9A14A] text-lg leading-none">عطارة</span>
              <span className="font-black text-[#F7F4EE] text-sm leading-none">آدم</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "text-sm font-semibold transition-all relative py-1",
                    location === link.path
                      ? "text-[#C9A14A]"
                      : "text-[#F7F4EE] hover:text-[#C9A14A]"
                  )}
                >
                  {link.name}
                  {location === link.path && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C9A14A] rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 border-r border-[#C9A14A]/20 pr-6">
              <Link href="/cart" className="relative group p-2 transition-all hover:bg-[#C9A14A]/10 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-[#F7F4EE] group-hover:text-[#C9A14A] transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-[#C9A14A] text-[#2F4F3A] text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[20px]">
                    {totalItems}
                  </span>
                )}
              </Link>
              <Button asChild className="font-bold text-sm px-6 h-10 bg-[#C9A14A] text-[#2F4F3A] hover:bg-[#E9DFC9] transition-all">
                <Link href="/products">تسوق الآن</Link>
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <Link href="/cart" className="relative p-2">
              <ShoppingCart className="w-5 h-5 text-[#F7F4EE]" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-[#C9A14A] text-[#2F4F3A] text-xs font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[20px]">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#F7F4EE]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#2F4F3A] border-b border-[#C9A14A]/20 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "block px-3 py-3 rounded-lg text-sm font-medium transition-all",
                  location === link.path
                    ? "bg-[#C9A14A]/20 text-[#C9A14A]"
                    : "text-[#F7F4EE] hover:bg-[#C9A14A]/10 hover:text-[#C9A14A]"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t border-[#C9A14A]/20">
              <Button asChild className="w-full font-bold text-sm bg-[#C9A14A] text-[#2F4F3A] hover:bg-[#E9DFC9]">
                <Link href="/products" onClick={() => setMobileMenuOpen(false)}>
                  تسوق الآن
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
