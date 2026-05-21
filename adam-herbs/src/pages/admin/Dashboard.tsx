import { motion } from "framer-motion";
import {
  useGetAnalyticsSummary,
  useGetSalesReport,
  useGetTopProducts,
  useListOrders,
  useResetAnalytics,
  getGetAnalyticsSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Package, ShoppingBag, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};
const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: summary, isLoading: loadingSummary } = useGetAnalyticsSummary();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const { data: salesReport, isLoading: loadingSales } = useGetSalesReport({ period }, {
    query: { queryKey: ["sales-report", period] }
  });
  const { data: topProducts, isLoading: loadingTop } = useGetTopProducts();
  const { data: recentOrders } = useListOrders({}, { query: { queryKey: ["orders"] } });
  const resetMutation = useResetAnalytics();

  const handleReset = (p: "daily" | "weekly" | "monthly" | "all") => {
    resetMutation.mutate({ data: { period: p } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAnalyticsSummaryQueryKey() });
        toast.success("تم إعادة ضبط الإحصائيات");
      }
    });
  };

  const statCards = [
    { label: "إجمالي الطلبات", value: summary?.totalOrders ?? 0, icon: ShoppingBag, color: "bg-primary/10 text-primary" },
    { label: "إجمالي الإيرادات", value: `${(summary?.totalRevenue ?? 0).toFixed(0)} ج.م`, icon: DollarSign, color: "bg-secondary/20 text-secondary" },
    { label: "طلبات اليوم", value: `${(summary?.dailyRevenue ?? 0).toFixed(0)} ج.م`, icon: TrendingUp, color: "bg-green-100 text-green-700" },
    { label: "إجمالي المنتجات", value: summary?.totalProducts ?? 0, icon: Package, color: "bg-blue-100 text-blue-700" },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">نظرة عامة على المتجر</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleReset("all")}
          disabled={resetMutation.isPending}
          className="gap-2"
          data-testid="button-reset-analytics"
        >
          <RotateCcw className="w-4 h-4" />
          إعادة ضبط
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card rounded-2xl p-5 border border-border shadow-sm"
              data-testid={`stat-card-${i}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              {loadingSummary ? (
                <Skeleton className="h-8 w-24 mb-1" />
              ) : (
                <p className="text-2xl font-black text-foreground">{card.value}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "قيد الانتظار", value: summary?.pendingOrders ?? 0, icon: Clock, cls: "text-yellow-600 bg-yellow-50" },
          { label: "تم التوصيل", value: summary?.deliveredOrders ?? 0, icon: CheckCircle, cls: "text-green-600 bg-green-50" },
          { label: "ملغية", value: summary?.cancelledOrders ?? 0, icon: XCircle, cls: "text-red-600 bg-red-50" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`rounded-2xl p-4 border border-border flex items-center gap-3 ${item.cls}`}>
              <Icon className="w-6 h-6 shrink-0" />
              <div>
                <p className="text-xl font-black">{item.value}</p>
                <p className="text-sm">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Chart */}
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h2 className="text-lg font-bold text-foreground">تقرير المبيعات</h2>
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                data-testid={`button-period-${p}`}
              >
                {p === "daily" ? "يومي" : p === "weekly" ? "أسبوعي" : "شهري"}
              </button>
            ))}
          </div>
        </div>
        {loadingSales ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesReport?.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontFamily: "Cairo" }}
                formatter={(v: number) => [`${v} ج.م`, "الإيرادات"]}
              />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Products + Recent Orders */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">أكثر المنتجات مبيعاً</h2>
          {loadingTop ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <div className="space-y-3">
              {(topProducts ?? []).slice(0, 6).map((p, i) => (
                <div key={p.productId} className="flex items-center gap-3" data-testid={`top-product-${p.productId}`}>
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{p.productNameAr}</p>
                    <p className="text-xs text-muted-foreground">{p.totalQuantity} قطعة</p>
                  </div>
                  <span className="text-sm font-bold text-secondary shrink-0">{p.totalRevenue.toFixed(0)} ج.م</span>
                </div>
              ))}
              {(topProducts ?? []).length === 0 && (
                <p className="text-center text-muted-foreground py-6 text-sm">لا توجد مبيعات بعد</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-lg font-bold text-foreground mb-4">آخر الطلبات</h2>
          <div className="space-y-3">
            {(recentOrders ?? []).slice(-6).reverse().map((order) => (
              <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30" data-testid={`recent-order-${order.id}`}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("ar-EG")}</p>
                </div>
                <div className="text-left shrink-0">
                  <p className="text-sm font-bold text-foreground">{order.total.toFixed(0)} ج.م</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] ?? ""}`}>
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </div>
              </div>
            ))}
            {(recentOrders ?? []).length === 0 && (
              <p className="text-center text-muted-foreground py-6 text-sm">لا توجد طلبات بعد</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
