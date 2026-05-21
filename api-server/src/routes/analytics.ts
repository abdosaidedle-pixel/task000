import { Router } from "express";
import { sql, gte, and, ne } from "drizzle-orm";
import { db, ordersTable, productsTable, categoriesTable } from "@workspace/db";
import {
  GetSalesReportQueryParams,
  ResetAnalyticsBody,
  GetAnalyticsSummaryResponse,
  GetSalesReportResponse,
  GetTopProductsResponse,
  ResetAnalyticsResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/analytics/summary", async (_req, res): Promise<void> => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [allOrders] = await db
    .select({
      total: sql<number>`count(*)`,
      revenue: sql<number>`coalesce(sum(total), 0)`,
    })
    .from(ordersTable)
    .where(ne(ordersTable.status, 'cancelled'));

  const [pending] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(sql`status = 'pending'`);

  const [delivered] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(sql`status = 'delivered'`);

  const [cancelled] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(sql`status = 'cancelled'`);

  const [daily] = await db
    .select({ revenue: sql<number>`coalesce(sum(total), 0)` })
    .from(ordersTable)
    .where(and(gte(ordersTable.createdAt, startOfDay), ne(ordersTable.status, 'cancelled')));

  const [weekly] = await db
    .select({ revenue: sql<number>`coalesce(sum(total), 0)` })
    .from(ordersTable)
    .where(and(gte(ordersTable.createdAt, startOfWeek), ne(ordersTable.status, 'cancelled')));

  const [monthly] = await db
    .select({ revenue: sql<number>`coalesce(sum(total), 0)` })
    .from(ordersTable)
    .where(and(gte(ordersTable.createdAt, startOfMonth), ne(ordersTable.status, 'cancelled')));

  const [productCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable);

  const [categoryCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(categoriesTable);

  res.json(
    GetAnalyticsSummaryResponse.parse({
      totalOrders: Number(allOrders?.total ?? 0),
      totalRevenue: Number(allOrders?.revenue ?? 0),
      pendingOrders: Number(pending?.count ?? 0),
      deliveredOrders: Number(delivered?.count ?? 0),
      cancelledOrders: Number(cancelled?.count ?? 0),
      dailyRevenue: Number(daily?.revenue ?? 0),
      weeklyRevenue: Number(weekly?.revenue ?? 0),
      monthlyRevenue: Number(monthly?.revenue ?? 0),
      totalProducts: Number(productCount?.count ?? 0),
      totalCategories: Number(categoryCount?.count ?? 0),
    })
  );
});

router.get("/analytics/sales", async (req, res): Promise<void> => {
  const query = GetSalesReportQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const period = query.data.period ?? "daily";
  const now = new Date();
  let startDate: Date;
  let dateFormat: string;

  if (period === "daily") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    dateFormat = "YYYY-MM-DD";
  } else if (period === "weekly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 83);
    dateFormat = "IYYY-IW";
  } else {
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    dateFormat = "YYYY-MM";
  }

  const rows = await db
    .select({
      date: sql<string>`to_char(created_at, ${dateFormat})`,
      revenue: sql<number>`coalesce(sum(total), 0)`,
      orderCount: sql<number>`count(*)`,
    })
    .from(ordersTable)
    .where(and(gte(ordersTable.createdAt, startDate), ne(ordersTable.status, 'cancelled')))
    .groupBy(sql`to_char(created_at, ${dateFormat})`)
    .orderBy(sql`to_char(created_at, ${dateFormat})`);

  const data = rows.map((r) => ({
    date: r.date,
    revenue: Number(r.revenue),
    orderCount: Number(r.orderCount),
  }));

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orderCount, 0);

  res.json(
    GetSalesReportResponse.parse({
      period,
      data,
      totalRevenue,
      totalOrders,
    })
  );
});

router.get("/analytics/top-products", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).where(ne(ordersTable.status, 'cancelled'));

  const productStats = new Map<
    number,
    { productNameAr: string; totalQuantity: number; totalRevenue: number }
  >();

  for (const order of orders) {
    const items = order.items as Array<{
      productId: number;
      productNameAr: string;
      quantity: number;
      unitPrice: number;
    }>;
    for (const item of items) {
      const existing = productStats.get(item.productId);
      if (existing) {
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += item.unitPrice * item.quantity;
      } else {
        productStats.set(item.productId, {
          productNameAr: item.productNameAr,
          totalQuantity: item.quantity,
          totalRevenue: item.unitPrice * item.quantity,
        });
      }
    }
  }

  const topProducts = Array.from(productStats.entries())
    .map(([productId, stats]) => ({ productId, ...stats }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  res.json(GetTopProductsResponse.parse(topProducts));
});

router.post("/analytics/reset", async (req, res): Promise<void> => {
  const parsed = ResetAnalyticsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [allOrders] = await db
    .select({
      total: sql<number>`count(*)`,
      revenue: sql<number>`coalesce(sum(total), 0)`,
    })
    .from(ordersTable)
    .where(ne(ordersTable.status, 'cancelled'));

  const [pending] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(sql`status = 'pending'`);

  const [delivered] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(sql`status = 'delivered'`);

  const [cancelled] = await db
    .select({ count: sql<number>`count(*)` })
    .from(ordersTable)
    .where(sql`status = 'cancelled'`);

  const [daily] = await db
    .select({ revenue: sql<number>`coalesce(sum(total), 0)` })
    .from(ordersTable)
    .where(and(gte(ordersTable.createdAt, startOfDay), ne(ordersTable.status, 'cancelled')));

  const [weekly] = await db
    .select({ revenue: sql<number>`coalesce(sum(total), 0)` })
    .from(ordersTable)
    .where(and(gte(ordersTable.createdAt, startOfWeek), ne(ordersTable.status, 'cancelled')));

  const [monthly] = await db
    .select({ revenue: sql<number>`coalesce(sum(total), 0)` })
    .from(ordersTable)
    .where(and(gte(ordersTable.createdAt, startOfMonth), ne(ordersTable.status, 'cancelled')));

  const [productCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productsTable);

  const [categoryCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(categoriesTable);

  res.json(
    ResetAnalyticsResponse.parse({
      totalOrders: Number(allOrders?.total ?? 0),
      totalRevenue: Number(allOrders?.revenue ?? 0),
      pendingOrders: Number(pending?.count ?? 0),
      deliveredOrders: Number(delivered?.count ?? 0),
      cancelledOrders: Number(cancelled?.count ?? 0),
      dailyRevenue: Number(daily?.revenue ?? 0),
      weeklyRevenue: Number(weekly?.revenue ?? 0),
      monthlyRevenue: Number(monthly?.revenue ?? 0),
      totalProducts: Number(productCount?.count ?? 0),
      totalCategories: Number(categoryCount?.count ?? 0),
    })
  );
});

export default router;
