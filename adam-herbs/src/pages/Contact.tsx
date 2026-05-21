import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Contact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    setSending(true);
    const waMsg = encodeURIComponent(
      `مرحباً، أنا ${name}\nالهاتف: ${phone}\n${email ? `البريد: ${email}\n` : ""}الرسالة: ${message}`
    );
    setTimeout(() => {
      setSending(false);
      window.open(`https://wa.me/201028193654?text=${waMsg}`, "_blank");
      toast.success("تم إرسال رسالتك عبر واتساب");
      setName(""); setPhone(""); setEmail(""); setMessage("");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFDF8] to-[#F7F4EE]" dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-[#2F4F3A] text-[#F7F4EE] py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-sm">
          <a href="/" className="hover:text-[#C9A14A] transition-colors">الرئيسية</a>
          <span className="mx-2">/</span>
          <span className="text-[#C9A14A]">تواصل معنا</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#2F4F3A] text-[#F7F4EE] py-16 px-4">
        <div className="max-w-4xl mx-auto text-right">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6"
          >
            تواصل معنا
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-[#E9DFC9] text-lg max-w-2xl"
          >
            نحن هنا لمساعدتك — أسئلة عن المنتجات، طلبات خاصة، أو أي استفسار آخر
          </motion.p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-2xl font-black text-[#2F4F3A] mb-8 text-right">معلومات التواصل</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="w-14 h-14 bg-[#C9A14A]/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#C9A14A] group-hover:text-[#2F4F3A] transition-all">
                  <MapPin className="w-6 h-6 text-[#2F4F3A]" />
                </div>
                <div className="text-right">
                  <p className="font-black text-[#2F4F3A] mb-2 text-lg">الموقع</p>
                  <p className="text-[#6F8F63] leading-relaxed">
                    الفيوم - سنورس<br />
                    شارع المدارس أمام مكتبة الطالب
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-14 h-14 bg-[#C9A14A]/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#C9A14A] group-hover:text-[#2F4F3A] transition-all">
                  <Phone className="w-6 h-6 text-[#2F4F3A]" />
                </div>
                <div className="text-right">
                  <p className="font-black text-[#2F4F3A] mb-2 text-lg">رقم الهاتف</p>
                  <a href="tel:+201028193654" className="block text-[#6F8F63] hover:text-[#C9A14A] transition-colors font-bold text-base mb-1" dir="ltr">
                    +20 1028193654
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-green-500 transition-all">
                  <MessageCircle className="w-6 h-6 text-green-600 group-hover:text-white" />
                </div>
                <div className="text-right">
                  <p className="font-black text-[#2F4F3A] mb-2 text-lg">واتساب</p>
                  <a
                    href="https://wa.me/201028193654"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-700 font-bold text-base transition-colors"
                    dir="ltr"
                  >
                    +20 1028193654
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-14 h-14 bg-[#C9A14A]/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#C9A14A] group-hover:text-[#2F4F3A] transition-all">
                  <Clock className="w-6 h-6 text-[#2F4F3A]" />
                </div>
                <div className="text-right">
                  <p className="font-black text-[#2F4F3A] mb-2 text-lg">ساعات العمل</p>
                  <p className="text-[#6F8F63] leading-relaxed">
                    يوميًا من 9 صباحًا حتى 11 مساءً
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-500 transition-all">
                  <Mail className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <div className="text-right">
                  <p className="font-black text-[#2F4F3A] mb-2 text-lg">وسائل التواصل</p>
                  <a
                    href="https://www.facebook.com/share/1FeBNfzFpY/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-bold transition-colors"
                  >
                    تابعنا على فيسبوك
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-lg border-2 border-[#E9DFC9] p-8"
        >
          <h2 className="text-2xl font-black text-[#2F4F3A] mb-8 text-right">أرسل رسالة</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#2F4F3A] mb-2 text-right">الاسم الكامل *</label>
              <Input
                placeholder="اسمك الكريم"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 border-2 border-[#E9DFC9] rounded-xl focus:border-[#C9A14A] focus:ring-[#C9A14A]/20 bg-[#FFFDF8] text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2F4F3A] mb-2 text-right">رقم الهاتف *</label>
              <Input
                placeholder="01xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="h-12 border-2 border-[#E9DFC9] rounded-xl focus:border-[#C9A14A] focus:ring-[#C9A14A]/20 bg-[#FFFDF8] text-left"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2F4F3A] mb-2 text-right">البريد الإلكتروني (اختياري)</label>
              <Input
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="h-12 border-2 border-[#E9DFC9] rounded-xl focus:border-[#C9A14A] focus:ring-[#C9A14A]/20 bg-[#FFFDF8] text-left"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#2F4F3A] mb-2 text-right">رسالتك *</label>
              <Textarea
                placeholder="اكتب استفسارك أو طلبك هنا..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="resize-none border-2 border-[#E9DFC9] rounded-xl focus:border-[#C9A14A] focus:ring-[#C9A14A]/20 bg-[#FFFDF8] text-right"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-bold gap-2 bg-[#C9A14A] text-[#2F4F3A] hover:bg-[#E9DFC9] transition-all"
              disabled={sending}
            >
              <Send className="w-5 h-5" />
              {sending ? "جاري الإرسال..." : "إرسال عبر واتساب"}
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Google Maps Section */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="text-right">
            <h2 className="text-2xl md:text-3xl font-black text-[#2F4F3A] mb-2">موقعنا على الخريطة</h2>
            <p className="text-[#6F8F63]">جدنا بسهولة على خريطة جوجل</p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border-2 border-[#E9DFC9] overflow-hidden h-[500px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.7833820834857!2d30.863207!3d29.409296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14564b9c0b9c9c0d%3A0x1234567890!2z2YXZitin2YTYsdmK!5e0!3m2!1sar!2seg!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="text-center">
            <a
              href="https://www.google.com/maps/search/29.409296,+30.863207?entry=tts&g_ep=EgoyMDI2MDUxMy4wIPu8ASoASAFQAw%3D%3D&skid=57d931bc-0e60-4ed8-8062-2698de62a93a"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#C9A14A] text-[#2F4F3A] px-8 py-3 rounded-full font-bold hover:bg-[#E9DFC9] transition-all shadow-md hover:shadow-lg"
            >
              <Check className="w-5 h-5" />
              فتح في خريطة جوجل
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
