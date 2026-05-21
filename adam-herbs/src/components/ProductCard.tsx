import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Product } from "@workspace/api-client-react";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      nameAr: product.nameAr,
      price: product.price,
      imageUrl: product.imageUrl || "/images/hero.png",
      quantity,
    });
    setQuantity(1); // Reset after adding
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.id}`}>
        <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.nameAr}
                className={cn(
                  "w-full h-full object-cover transition-transform duration-700",
                  isHovered ? "scale-110" : "scale-100"
                )}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground">صورة المنتج</span>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
              {product.featured && (
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  مميز
                </span>
              )}
              {hasDiscount && (
                <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  تخفيض
                </span>
              )}
              {!product.inStock && (
                <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-border">
                  نفذت الكمية
                </span>
              )}
            </div>

            {/* Hover overlay with add to cart (desktop) */}
            <div className={cn(
              "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 opacity-0 hidden md:flex",
              isHovered && product.inStock && "opacity-100"
            )}>
              <Button onClick={handleAddToCart} size="lg" className="font-bold gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <ShoppingCart className="w-5 h-5" />
                أضف للسلة
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-grow">
            <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
              {product.nameAr}
            </h3>
            
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
              {product.descriptionAr || "منتج طبيعي عالي الجودة من عطارة آدم."}
            </p>

            <div className="flex items-end justify-between mt-auto pt-4 border-t border-border/50">
              <div>
                <div className="text-sm text-muted-foreground font-medium">
                  {product.unit ? `لكل ${product.unit}` : "السعر"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-primary">
                    {product.price} ج.م
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                      {product.originalPrice} ج.م
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile add to cart / Desktop quantity */}
              {product.inStock ? (
                <div className="md:hidden">
                  <Button onClick={handleAddToCart} size="icon" className="rounded-full shadow-md">
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-sm font-bold text-destructive">غير متوفر</div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
