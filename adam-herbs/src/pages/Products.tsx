import { useState, useEffect } from "react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  const { data: categories } = useListCategories();

  // Parse URL query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get("category");
    if (categoryId) {
      setSelectedCategory(parseInt(categoryId));
    }
  }, []);

  const productParams: Record<string, unknown> = {};
  if (selectedCategory !== null) productParams.categoryId = selectedCategory;
  if (searchQuery) productParams.search = searchQuery;

  const { data: products, isLoading } = useListProducts(productParams);

  const sortedProducts = products?.sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "name") return a.nameAr.localeCompare(b.nameAr);
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF8] to-[#F7F4EE]">
      {/* Breadcrumb */}
      <div className="bg-[#2F4F3A] text-[#F7F4EE] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-sm">
          <a href="/" className="hover:text-[#C9A14A] transition-colors">الرئيسية</a>
          <span className="mx-2">/</span>
          <span className="text-[#C9A14A]">المنتجات</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-[#2F4F3A] text-[#F7F4EE] pt-12 pb-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay">
          <img src="/images/spices.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-right">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-4"
          >
            منتجاتنا
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#E9DFC9] text-lg max-w-2xl"
          >
            تصفح مجموعتنا الواسعة من الأعشاب والتوابل والمنتجات الطبيعية عالية الجودة
          </motion.p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-black text-[#2F4F3A] mb-8 text-right">الأقسام</h2>
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedCategory(null)}
            className={`flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-full transition-all min-w-max ${
              selectedCategory === null
                ? "bg-[#C9A14A] text-[#2F4F3A] shadow-lg"
                : "bg-white border-2 border-[#E9DFC9] text-[#2F4F3A] hover:border-[#C9A14A]"
            }`}
          >
            <span className="text-xl md:text-2xl">📦</span>
            <span className="text-xs md:text-sm font-bold">الكل</span>
          </motion.button>
          {categories?.map((cat, idx) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-full transition-all min-w-max ${
                selectedCategory === cat.id
                  ? "bg-[#C9A14A] text-[#2F4F3A] shadow-lg"
                  : "bg-white border-2 border-[#E9DFC9] text-[#2F4F3A] hover:border-[#C9A14A]"
              }`}
            >
              <span className="text-xl md:text-2xl">{cat.icon || "🌿"}</span>
              <span className="text-xs md:text-sm font-bold text-center line-clamp-1 md:line-clamp-2">{cat.nameAr}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-2xl shadow-md border-2 border-[#E9DFC9] p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96 shrink-0">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F8F63] w-5 h-5" />
            <Input
              placeholder="ابحث عن المنتجات..."
              className="pl-4 pr-10 h-12 text-base rounded-xl bg-[#F7F4EE] border-2 border-transparent focus-visible:border-[#C9A14A] focus-visible:ring-[#C9A14A]/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 flex gap-4 items-center">
            <span className="text-[#6F8F63] font-medium whitespace-nowrap text-right">ترتيب حسب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 h-12 border-2 border-[#E9DFC9] rounded-xl px-4 bg-[#FFFDF8] text-[#2F4F3A] font-medium hover:border-[#C9A14A] transition-colors focus:outline-none focus:border-[#C9A14A]"
              dir="rtl"
            >
              <option value="newest">الأحدث</option>
              <option value="price-low">السعر: من الأقل للأعلى</option>
              <option value="price-high">السعر: من الأعلى للأقل</option>
              <option value="name">الاسم</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[400px] bg-[#E9DFC9]/30 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : sortedProducts?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-[#E9DFC9]">
            <PackageX className="w-16 h-16 mx-auto text-[#C9A14A] mb-4" />
            <h3 className="text-2xl font-black text-[#2F4F3A] mb-2">لا توجد منتجات</h3>
            <p className="text-[#6F8F63] text-lg mb-6">لم يتم العثور على منتجات تطابق بحثك. جرب كلمات بحث مختلفة.</p>
            <Button
              className="bg-[#C9A14A] text-[#2F4F3A] hover:bg-[#E9DFC9] font-bold"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              عرض جميع المنتجات
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedProducts?.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
