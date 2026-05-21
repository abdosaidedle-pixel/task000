import { Router } from "express";
import { eq, and, gte, lte, SQL } from "drizzle-orm";
import { db, ordersTable, productsTable } from "@workspace/db";
import {
  CreateOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  ListOrdersQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/orders", async (req, res): Promise<void> => {
  const query = ListOrdersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions: SQL[] = [];
  if (query.data.status) {
    conditions.push(eq(ordersTable.status, query.data.status));
  }
  if (query.data.from) {
    conditions.push(gte(ordersTable.createdAt, new Date(query.data.from)));
  }
  if (query.data.to) {
    conditions.push(lte(ordersTable.createdAt, new Date(query.data.to)));
  }

  const orders =
    conditions.length > 0
      ? await db
          .select()
          .from(ordersTable)
          .where(and(...conditions))
          .orderBy(ordersTable.createdAt)
      : await db.select().from(ordersTable).orderBy(ordersTable.createdAt);

  res.json(orders);
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const productIds = parsed.data.items.map((item) => item.productId);

  const allProducts = await Promise.all(
    productIds.map((id) =>
      db.select().from(productsTable).where(eq(productsTable.id, id))
    )
  );

  const productMap = new Map<number, { nameAr: string; price: number }>();
  allProducts.forEach((rows) => {
    if (rows[0]) {
      productMap.set(rows[0].id, {
        nameAr: rows[0].nameAr,
        price: rows[0].price,
      });
    }
  });

  const items = parsed.data.items.map((item) => {
    const product = productMap.get(item.productId);
    return {
      productId: item.productId,
      productNameAr: product?.nameAr ?? "منتج",
      quantity: item.quantity,
      unitPrice: product?.price ?? 0,
    };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const shippingCost = 30;
  const total = subtotal + shippingCost;

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerAddress: parsed.data.customerAddress,
      notes: parsed.data.notes ?? null,
      items,
      subtotal,
      shippingCost,
      total,
      status: "pending",
    })
    .returning();

  res.status(201).json(order);
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(order);
});

router.patch("/orders/:id/status", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateOrderStatusBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [order] = await db
    .update(ordersTable)
    .set({ status: body.data.status })
    .where(eq(ordersTable.id, params.data.id))
    .returning();
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(order);
});

export default router;
