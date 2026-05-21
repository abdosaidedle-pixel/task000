import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useListBanners, useListProducts, Banner } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Leaf, Droplet, Sparkles } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

export default function Home() {
  const { data: banners } = useListBanners();
  const { data: featuredProducts, isLoading: loadingProducts } = useListProducts({ featured: true });
  const [emblaRef] = useEmblaCarousel({ loop: true, direction: "rtl" });

  const activeBanners = banners?.filter(b => b.active) || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#2F4F3A]">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero.png"
            alt="عطارة آدم"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#2F4F3A]/60 via-[#2F4F3A]/40 to-transparent" />
        </div>

        <div className="relative z-10 text-right px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-[#F7F4EE] leading-tight drop-shadow-2xl">
              أسرار الطبيعة
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xl md:text-2xl text-[#E9DFC9] mb-4 drop-shadow-lg"
          >
            من الأرض إلى بيتك مباشرة
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-[#FFFDF8]/90 mb-8 max-w-2xl leading-relaxed drop-shadow-lg"
          >
            أجود أنواع الأعشاب والتوابل والعسل والزيوت الطبيعية، منتقاة بعناية فائقة لصحتك وراحتك.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-start"
          >
            <Button size="lg" className="text-lg px-8 h-14 font-bold shadow-xl bg-[#C9A14A] text-[#2F4F3A] hover:bg-[#E9DFC9]" asChild>
              <Link href="/products">تسوق الآن</Link>
            </Button>
            <Button size="lg" className="text-lg px-8 h-14 font-bold bg-[#6F8F63] text-white hover:bg-[#6F8F63]/80" asChild>
              <Link href="/contact">تواصل معنا</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Promotional Banners */}
      {activeBanners.length > 0 && (
        <section className="py-12 bg-[#F7F4EE]/50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex touch-pan-y">
                {activeBanners.map((banner) => (
                  <div key={banner.id} className="flex-[0_0_100%] min-w-0 px-4">
                    <div
                      className="rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden text-white"
                      style={{ backgroundColor: banner.bgColor || "#2F4F3A" }}
                    >
                      {banner.imageUrl && (
                        <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay">
                          <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-black mb-4">{banner.titleAr}</h2>
                        {banner.subtitleAr && <p className="text-lg md:text-xl opacity-90 mb-6 leading-relaxed">{banner.subtitleAr}</p>}
                        {banner.linkUrl && (
                          <Button asChild className="font-bold bg-[#C9A14A] text-[#2F4F3A] hover:bg-[#E9DFC9]">
                            <a href={banner.linkUrl}>اكتشف المزيد</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-[#FFFDF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#2F4F3A] mb-4">لماذا تختار عطارة آدم؟</h2>
            <p className="text-[#6F8F63] text-lg max-w-2xl mx-auto">نسعى دائماً لتقديم أفضل المنتجات الطبيعية لعملائنا الكرام</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border-2 border-[#E9DFC9] shadow-md text-center hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 bg-[#C9A14A]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-[#6F8F63]" />
              </div>
              <h3 className="text-xl font-bold text-[#2F4F3A] mb-3">وصفات وخلطات طبيعية</h3>
              <p className="text-[#6F8F63] leading-relaxed">منتجات طبيعية خالصة منتقاة بعناية من أفضل المصادر العالمية.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border-2 border-[#E9DFC9] shadow-md text-center hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 bg-[#C9A14A]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Droplet className="w-8 h-8 text-[#6F8F63]" />
              </div>
              <h3 className="text-xl font-bold text-[#2F4F3A] mb-3">طحن طازج</h3>
              <p className="text-[#6F8F63] leading-relaxed">نحافظ على جودة المنتجات من خلال طحن طازج وتخزين آمن.</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl border-2 border-[#E9DFC9] shadow-md text-center hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 bg-[#C9A14A]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-[#6F8F63]" />
              </div>
              <h3 className="text-xl font-bold text-[#2F4F3A] mb-3">جودة مضمونة 100%</h3>
              <p className="text-[#6F8F63] leading-relaxed">ضمان كامل على جودة المنتجات مع خدمة عملاء متميزة.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-[#F7F4EE]/50 to-[#FFFDF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-[#2F4F3A] mb-4">المنتجات المميزة</h2>
              <p className="text-[#6F8F63] text-lg">تشكيلة مختارة من أفضل مبيعاتنا</p>
            </div>
            <Button variant="ghost" className="text-[#6F8F63] font-bold hidden sm:flex hover:text-[#C9A14A]" asChild>
              <Link href="/products" className="flex items-center gap-2">
                عرض الكل <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[400px] bg-[#E9DFC9]/20 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : featuredProducts?.length === 0 ? (
            <div className="text-center py-12 text-[#6F8F63] bg-white rounded-2xl border-2 border-[#E9DFC9]">
              لا توجد منتجات مميزة حالياً
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Button className="w-full font-bold bg-[#C9A14A] text-[#2F4F3A] hover:bg-[#E9DFC9] h-12" asChild>
              <Link href="/products">عرض كل المنتجات</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
