import { Link } from "wouter";
import { Facebook, Phone, MapPin, Heart, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#2F4F3A] text-[#F7F4EE] pt-16 pb-8 border-t border-[#C9A14A]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 text-[#F7F4EE] mb-4">
              <div className="w-10 h-10 rounded-full bg-[#C9A14A] flex items-center justify-center font-black text-[#2F4F3A]">
                ع
              </div>
              <div className="flex flex-col">
                <span className="font-black text-[#C9A14A] text-sm leading-none">عطارة</span>
                <span className="font-black text-[#F7F4EE] text-xs leading-none">آدم</span>
              </div>
            </Link>
            <p className="text-[#E9DFC9] mb-6 text-sm leading-relaxed">
              أسرار الطبيعة بين يديك. أجود أنواع الأعشاب، التوابل، العسل، والزيوت الطبيعية المنتقاة بعناية.
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/share/1FeBNfzFpY/" target="_blank" rel="noopener noreferrer" className="p-2 bg-[#C9A14A]/10 rounded-full hover:bg-[#C9A14A] hover:text-[#2F4F3A] transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://wa.me/201028193654" target="_blank" rel="noopener noreferrer" className="p-2 bg-green-500/10 rounded-full hover:bg-green-500 hover:text-white transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black mb-6 text-[#C9A14A] border-b border-[#C9A14A]/20 pb-3">روابط سريعة</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-[#E9DFC9] hover:text-[#C9A14A] transition-colors text-sm">الرئيسية</Link>
              </li>
              <li>
                <Link href="/products" className="text-[#E9DFC9] hover:text-[#C9A14A] transition-colors text-sm">المنتجات</Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#E9DFC9] hover:text-[#C9A14A] transition-colors text-sm">تواصل معنا</Link>
              </li>
              <li>
                <Link href="/cart" className="text-[#E9DFC9] hover:text-[#C9A14A] transition-colors text-sm">سلة المشتريات</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-black mb-6 text-[#C9A14A] border-b border-[#C9A14A]/20 pb-3">الأقسام</h3>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-[#E9DFC9] hover:text-[#C9A14A] transition-colors text-sm">عسل ومكسرات</Link></li>
              <li><Link href="/products" className="text-[#E9DFC9] hover:text-[#C9A14A] transition-colors text-sm">توابل</Link></li>
              <li><Link href="/products" className="text-[#E9DFC9] hover:text-[#C9A14A] transition-colors text-sm">أعشاب</Link></li>
              <li><Link href="/products" className="text-[#E9DFC9] hover:text-[#C9A14A] transition-colors text-sm">زيوت طبيعية</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-black mb-6 text-[#C9A14A] border-b border-[#C9A14A]/20 pb-3">تواصل معنا</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C9A14A] shrink-0 mt-0.5" />
                <span className="text-[#E9DFC9] leading-relaxed">الفيوم - سنورس - شارع المدارس أمام مكتبة الطالب</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C9A14A] shrink-0" />
                <a href="tel:+201028193654" className="text-[#E9DFC9] hover:text-[#C9A14A] transition-colors">01028193654</a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-green-500 shrink-0" />
                <a href="https://wa.me/201028193654" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#C9A14A]/20 flex flex-col md:flex-row justify-between items-center gap-4 text-[#E9DFC9]/70 text-xs">
          <p>© {new Date().getFullYear()} عطارة آدم. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-1">
            مع
            <Heart className="w-3 h-3 text-red-500 fill-current inline" />
          </p>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/201028193654"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all z-40"
        title="تواصل معنا عبر واتساب"
      >
        <MessageCircle className="w-7 h-7" />
      </a>

      {/* Floating Call Button */}
      <a
        href="tel:+201028193654"
        className="fixed bottom-24 left-6 w-14 h-14 bg-[#C9A14A] text-[#2F4F3A] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all z-40"
        title="اتصل بنا"
      >
        <Phone className="w-7 h-7" />
      </a>
    </footer>
  );
}
