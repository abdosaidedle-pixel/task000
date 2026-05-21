import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/components/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Send } from "lucide-react";
import { useCreateOrder } from "@workspace/api-client-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "الاسم مطلوب"),
  customerPhone: z.string().min(10, "رقم الهاتف غير صحيح"),
  customerAddress: z.string().min(5, "العنوان بالتفصيل مطلوب"),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const createOrder = useCreateOrder();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      notes: "",
    },
  });

  const shippingCost = items.length > 0 ? 30 : 0; // Flat 30 EGP shipping for example
  const total = subtotal + shippingCost;

  const onSubmit = (data: CheckoutFormValues) => {
    if (items.length === 0) return;

    createOrder.mutate({
      data: {
        ...data,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      }
    }, {
      onSuccess: (order) => {
        // Send WhatsApp message
        const itemsText = items.map(i => `- ${i.nameAr} (${i.quantity}x) = ${i.price * i.quantity} ج.م`).join('%0A');
        const text = `طلب جديد من عطارة آدم!%0A%0Aالاسم: ${data.customerName}%0Aالعنوان: ${data.customerAddress}%0Aرقم الطلب: #${order.id}%0A%0Aالمنتجات:%0A${itemsText}%0A%0Aالمجموع: ${subtotal} ج.م%0Aالشحن: ${shippingCost} ج.م%0Aالإجمالي الكلي: ${total} ج.م`;
        
        window.open(`https://wa.me/201028193654?text=${text}`, '_blank');
        
        toast.success("تم إرسال طلبك بنجاح");
        clearCart();
        setIsCheckingOut(false);
      },
      onError: () => {
        toast.error("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى");
      }
    });
  };

  if (items.length === 0 && !isCheckingOut) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-4">سلة المشتريات فارغة</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          لم تقم بإضافة أي منتجات إلى سلة المشتريات بعد. اكتشف منتجاتنا الطبيعية المميزة!
        </p>
        <Button asChild size="lg" className="font-bold rounded-full px-8">
          <Link href="/products">العودة للتسوق</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black text-foreground mb-8">سلة المشتريات</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="bg-card rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border border-border shadow-sm">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.nameAr} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 w-full text-center sm:text-right">
                  <Link href={`/products?id=${item.productId}`}>
                    <h3 className="font-bold text-lg text-foreground hover:text-primary transition-colors mb-1">{item.nameAr}</h3>
                  </Link>
                  <p className="text-primary font-black text-lg mb-4">{item.price} ج.م</p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-4">
                    <div className="flex items-center border border-border rounded-full p-1 bg-muted/50">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-background hover:bg-muted text-foreground transition-colors shadow-sm"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-background hover:bg-muted text-foreground transition-colors shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="hidden sm:block text-left w-32 border-r border-border pr-6">
                  <p className="text-sm text-muted-foreground mb-1">الإجمالي</p>
                  <p className="font-bold text-xl text-foreground">{item.price * item.quantity} ج.م</p>
                </div>
              </div>
            ))}
            
            {!isCheckingOut && (
              <Button asChild variant="outline" className="mt-4 font-bold border-border/50 text-foreground/70">
                <Link href="/products" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> متابعة التسوق
                </Link>
              </Button>
            )}
          </div>

          {/* Checkout sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6 pb-4 border-b border-border">ملخص الطلب</h2>
              
              <div className="space-y-4 mb-6 text-base">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span className="font-medium text-foreground">{subtotal} ج.م</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>تكلفة الشحن</span>
                  <span className="font-medium text-foreground">{shippingCost} ج.م</span>
                </div>
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="font-bold text-foreground">الإجمالي الكلي</span>
                  <span className="text-2xl font-black text-primary">{total} ج.م</span>
                </div>
              </div>

              {!isCheckingOut ? (
                <Button 
                  className="w-full h-12 text-lg font-bold rounded-xl shadow-md"
                  onClick={() => setIsCheckingOut(true)}
                >
                  إتمام الطلب
                </Button>
              ) : (
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" /> 
                    بيانات التوصيل
                  </h3>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الاسم بالكامل</FormLabel>
                            <FormControl>
                              <Input placeholder="الاسم" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رقم الهاتف</FormLabel>
                            <FormControl>
                              <Input placeholder="010..." {...field} dir="ltr" className="text-left" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>العنوان بالتفصيل</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="المحافظة، المدينة، الشارع، رقم المبنى..." 
                                className="resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="أي تفاصيل إضافية للطلب أو التوصيل"
                                className="resize-none"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4 flex flex-col gap-3">
                        <Button 
                          type="submit" 
                          className="w-full h-12 text-lg font-bold rounded-xl shadow-md bg-green-600 hover:bg-green-700 text-white"
                          disabled={createOrder.isPending}
                        >
                          {createOrder.isPending ? "جاري الإرسال..." : "تأكيد وإرسال عبر واتساب"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost"
                          onClick={() => setIsCheckingOut(false)}
                          className="w-full text-muted-foreground"
                        >
                          تعديل السلة
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
