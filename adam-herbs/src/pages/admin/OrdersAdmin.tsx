import { useState } from "react";
import {
  useListOrders,
  useUpdateOrderStatus,
  getListOrdersQueryKey,
  type Order,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, ChevronDown, Phone, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "pending", label: "قيد الانتظار", cls: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "مؤكد", cls: "bg-blue-100 text-blue-800" },
  { value: "delivered", label: "تم التوصيل", cls: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "ملغي", cls: "bg-red-100 text-red-800" },
];

function statusInfo(status: string) {
  return STATUS_OPTIONS.find(s => s.value === status) ?? { label: status, cls: "bg-gray-100 text-gray-800" };
}

export default function OrdersAdmin() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: orders, isLoading } = useListOrders(
    filterStatus ? { status: filterStatus as Order["status"] } : {},
    { query: { queryKey: ["orders", filterStatus] } }
  );

  const updateStatus = useUpdateOrderStatus();

  const handleUpdateStatus = (orderId: number, status: string) => {
    updateStatus.mutate(
      { id: orderId, data: { status: status as Order["status"] } } as Parameters<typeof updateStatus.mutate>[0],
      {
        onSuccess: () => {
          toast.success("تم تحديث حالة الطلب");
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        },
        onError: () => toast.error("حدث خطأ أثناء التحديث"),
      }
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">إدارة الطلبات</h1>
          <p className="text-muted-foreground mt-1">{orders?.length ?? 0} طلب</p>
        </div>
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus(null)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            data-testid="filter-all"
          >
            الكل
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => setFilterStatus(s.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === s.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              data-testid={`filter-${s.value}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : (
        <div className="space-y-3">
          {([...(orders ?? [])]).reverse().map((order) => {
            const si = statusInfo(order.status);
            const isExpanded = expandedId === order.id;
            const items = order.items as Array<{ productNameAr: string; quantity: number; unitPrice: number }>;
            return (
              <div
                key={order.id}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
                data-testid={`order-row-${order.id}`}
              >
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-foreground">{order.customerName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${si.cls}`}>{si.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                      {" · "}
                      {items.length} منتج
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="font-black text-foreground text-lg">{order.total.toFixed(0)} ج.م</p>
                  </div>

                  {/* Status Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 shrink-0"
                        onClick={e => e.stopPropagation()}
                        data-testid={`button-status-${order.id}`}
                      >
                        تغيير الحالة <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" dir="rtl">
                      {STATUS_OPTIONS.map(s => (
                        <DropdownMenuItem
                          key={s.value}
                          onClick={() => handleUpdateStatus(order.id, s.value)}
                          className={order.status === s.value ? "font-bold" : ""}
                          data-testid={`status-option-${s.value}`}
                        >
                          {s.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {isExpanded && (
                  <div className="border-t border-border p-4 bg-muted/10">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span dir="ltr" className="font-medium">{order.customerPhone}</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span>{order.customerAddress}</span>
                        </div>
                        {order.notes && (
                          <div className="flex items-start gap-2 text-sm">
                            <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{order.notes}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-2">المنتجات:</p>
                        <div className="space-y-1">
                          {items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span>{item.productNameAr} × {item.quantity}</span>
                              <span className="font-medium">{(item.unitPrice * item.quantity).toFixed(0)} ج.م</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
                          <span>الإجمالي</span>
                          <span>{order.total.toFixed(0)} ج.م</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {(orders ?? []).length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>لا توجد طلبات بعد</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
