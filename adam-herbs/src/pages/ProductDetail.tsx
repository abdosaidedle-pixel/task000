import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowRight, Minus, Plus, Star, Leaf, Tag } from "lucide-react";
import { useGetProduct, useListProducts, useListCategories } from "@workspace/api-client-react";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";

const WEIGHT_OPTIONS = [
  { label: "250 جرام", value: 0.25 },
  { label: "500 جرام", value: 0.5 },
  { label: "1 كجم", value: 1 },
  { label: "2 كجم", value: 2 },
  { label: "3 كجم", value: 3 },
];

const LITER_OPTIONS = [
  { label: "0.5 لتر", value: 0.5 },
  { label: "1 لتر", value: 1 },
  { label: "2 لتر", value: 2 },
  { label: "4 لتر", value: 4 },
];

function isWeightUnit(unit?: string | null) {
  if (!unit) return false;
  return /كجم|كيلو|جرام|جم|gram|kg/i.test(unit);
}

function isLiterUnit(unit?: string | null) {
  if (!unit) return false;
  return /لتر|liter|litre|l\b/i.test(unit);
}

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id ?? "0");
  const [, setLocation] = useLocation();
  const { addItem } = useCart();

  const { data: product, isLoading, error } = useGetProduct(productId);
  const { data: categories } = useListCategories();

  const isWeight = isWeightUnit(product?.unit);
  const isLiter = isLiterUnit(product?.unit);
  const isSpecialUnit = isWeight || isLiter;
  const options = isLiter ? LITER_OPTIONS : WEIGHT_OPTIONS;

  const [selectedWeight, setSelectedWeight] = useState<number>(isWeight ? 1 : 0.5);
  const [qty, setQty] = useState(1);

  const { data: relatedRaw } = useListProducts({
    categoryId: product?.categoryId ?? undefined,
    limit: 5,
  });
  const related = (relatedRaw ?? []).filter((p) => p.id !== productId).slice(0, 4);

  const category = categories?.find((c) => c.id === product?.categoryId);
  const hasDiscount = product?.originalPrice && product.originalPrice > product.price;

  const handleAddToCart = () => {
    if (!product) return;
    const finalQty = isSpecialUnit ? selectedWeight : qty;
    const displayUnit = isSpecialUnit
      ? (isLiter ? `${selectedWeight} لتر` : selectedWeight < 1 ? `${selectedWeight * 1000} جرام` : `${selectedWeight} كجم`)
      : qty.toString();

    addItem({
      productId: product.id,
      nameAr: `${product.nameAr}${isSpecialUnit ? ` (${displayUnit})` : ""}`,
      price: product.price * (isSpecialUnit ? selectedWeight : qty),
      imageUrl: product.imageUrl || "",
      quantity: 1,
    });
    toast.success(`تمت الإضافة للسلة — ${product.nameAr} ${displayUnit}`);
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" dir="rtl">
        <p className="text-muted-foreground text-lg">المنتج غير موجود</p>
        <Button onClick={() => setLocation("/products")} variant="outline" className="gap-2">
          <ArrowRight className="w-4 h-4" />
          العودة للمنتجات
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <button onClick={() => setLocation("/")} className="hover:text-primary transition-colors">الرئيسية</button>
          <span>/</span>
          <button onClick={() => setLocation("/products")} className="hover:text-primary transition-colors">المنتجات</button>
          {category && (
            <>
              <span>/</span>
              <button
                onClick={() => setLocation(`/products?category=${category.id}`)}
                className="hover:text-primary transition-colors"
              >
                {category.nameAr}
              </button>
            </>
          )}
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">{product.nameAr}</span>
        </nav>

        {/* Main product layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden border border-border shadow-xl bg-muted/20">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.nameAr}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/5 to-secondary/10">
                  <Leaf className="w-20 h-20 text-primary/30" />
                  <span className="text-muted-foreground text-lg">صورة المنتج</span>
                </div>
              )}
            </div>

            {/* Floating badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {product.featured && (
                <Badge className="bg-secondary text-secondary-foreground shadow-md text-sm px-3 py-1">
                  ⭐ مميز
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="shadow-md text-sm px-3 py-1">
                  تخفيض {Math.round((1 - product.price / product.originalPrice!) * 100)}%
                </Badge>
              )}
              {!product.inStock && (
                <Badge variant="secondary" className="shadow-md text-sm px-3 py-1 border border-border">
                  نفذت الكمية
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* Category & Name */}
            {category && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-secondary" />
                <span className="text-secondary font-semibold text-sm">{category.nameAr}</span>
              </div>
            )}

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight mb-2">
                {product.nameAr}
              </h1>
              {product.nameEn && (
                <p className="text-muted-foreground text-base" dir="ltr">{product.nameEn}</p>
              )}
            </div>

            {/* Rating (decorative) */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
              ))}
              <span className="text-sm text-muted-foreground mr-2">منتج عالي الجودة</span>
            </div>

            {/* Price */}
            <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-primary">
                  {isSpecialUnit
                    ? (product.price * (isLiter ? selectedWeight : selectedWeight)).toFixed(2)
                    : product.price}
                  <span className="text-xl mr-1">ج.م</span>
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through decoration-destructive/50 mb-1">
                    {isSpecialUnit
                      ? (product.originalPrice! * selectedWeight).toFixed(2)
                      : product.originalPrice} ج.م
                  </span>
                )}
              </div>
              {product.unit && (
                <p className="text-muted-foreground text-sm mt-1">السعر لكل {product.unit}</p>
              )}
            </div>

            {/* Description */}
            {product.descriptionAr && (
              <div className="prose prose-sm max-w-none">
                <p className="text-foreground/80 leading-relaxed text-base border-r-4 border-secondary pr-4">
                  {product.descriptionAr}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            {product.inStock && (
              <div>
                {isSpecialUnit ? (
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-3">
                      {isLiter ? "اختر الكمية (لتر)" : "اختر الوزن"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSelectedWeight(opt.value)}
                          className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all duration-200 ${
                            selectedWeight === opt.value
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : "border-border bg-card text-foreground hover:border-primary/50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-foreground mb-3">الكمية</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-2xl font-black text-foreground w-8 text-center">{qty}</span>
                      <button
                        onClick={() => setQty((q) => q + 1)}
                        className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      {product.unit && (
                        <span className="text-muted-foreground text-sm">{product.unit}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add to cart */}
            <div className="flex gap-3 mt-2">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                size="lg"
                className="flex-1 font-bold text-base h-14 gap-3 rounded-2xl shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.inStock ? "أضف للسلة" : "نفذت الكمية"}
              </Button>
              <Button
                onClick={() => setLocation("/products")}
                variant="outline"
                size="lg"
                className="h-14 px-5 rounded-2xl"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Store trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
              {[
                { icon: "🌿", text: "منتج طبيعي 100%" },
                { icon: "🚚", text: "توصيل سريع" },
                { icon: "✅", text: "جودة مضمونة" },
              ].map((badge) => (
                <div key={badge.text} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-xs text-muted-foreground font-medium">{badge.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-foreground mb-6 flex items-center gap-2">
              <Leaf className="w-6 h-6 text-secondary" />
              منتجات مشابهة
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
