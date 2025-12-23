import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db-mongo";
import { connectMongoDB } from "./mongodb";
import { extendedRouter } from "./routers-extended";

// تهيئة MongoDB عند بدء التطبيق
connectMongoDB().catch(err => console.error("[MongoDB] Failed to connect:", err));
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

// Admin procedure that checks for admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Products API
  products: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit || 20;
        const offset = input?.offset || 0;
        return db.getProducts(limit, offset);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        return product;
      }),

    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return db.searchProducts(input.query, input.limit, input.offset);
      }),

    byCategory: publicProcedure
      .input(z.object({ categoryId: z.number(), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return db.getProductsByCategory(input.categoryId, input.limit, input.offset);
      }),

    // Admin: Create product
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        categoryId: z.number(),
        price: z.string(),
        originalPrice: z.string().optional(),
        image: z.string().optional(),
        images: z.array(z.string()).optional(),
        stock: z.number().default(0),
        status: z.enum(["available", "unavailable", "coming_soon"]).default("available"),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createProduct(input as any);
      }),

    // Admin: Update product
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        categoryId: z.number().optional(),
        price: z.string().optional(),
        originalPrice: z.string().optional(),
        image: z.string().optional(),
        images: z.array(z.string()).optional(),
        stock: z.number().optional(),
        status: z.enum(["available", "unavailable", "coming_soon"]).optional(),
        tags: z.array(z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateProduct(id, data as any);
      }),

    // Admin: Delete product
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteProduct(input.id);
      }),
  }),

  // Categories API
  categories: router({
    list: publicProcedure.query(async () => {
      return db.getCategories();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCategoryById(input.id);
      }),

    // Admin: Create category
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        image: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createCategory(input as any);
      }),

    // Admin: Update category
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateCategory(id, data as any);
      }),

    // Admin: Delete category
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteCategory(input.id);
      }),
  }),

  // Cart API
  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const items = await db.getCartItems(ctx.user.id);
      // Fetch product details for each cart item
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await db.getProductById(item.productId);
          return { ...item, product };
        })
      );
      return itemsWithProducts;
    }),

    add: protectedProcedure
      .input(z.object({ productId: z.number(), quantity: z.number().default(1) }))
      .mutation(async ({ input, ctx }) => {
        return db.addCartItem(ctx.user.id, input.productId, input.quantity);
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.removeCartItem(input.id);
      }),

    updateQuantity: protectedProcedure
      .input(z.object({ id: z.number(), quantity: z.number() }))
      .mutation(async ({ input }) => {
        return db.updateCartItemQuantity(input.id, input.quantity);
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      return db.clearCart(ctx.user.id);
    }),
  }),

  // Orders API
  orders: router({
    create: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerEmail: z.string().email(),
        customerPhone: z.string(),
        customerAddress: z.string(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
          price: z.string(),
          productName: z.string(),
        })),
        totalAmount: z.string(),
        paymentMethod: z.string().default("cash_on_delivery"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const orderNumber = `ORD-${Date.now()}`;
        const order = await db.createOrder({
          orderNumber,
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress,
          totalAmount: input.totalAmount as any,
          paymentMethod: input.paymentMethod,
          notes: input.notes,
          userId: ctx.user?.id,
          status: "pending",
        } as any);

        // Create order items
        if (order) {
          for (const item of input.items) {
            await db.createOrderItem({
              orderId: (order as any).insertId || 1,
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price as any,
            });
          }
        }

        return order;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }
        const items = await db.getOrderItems(input.id);
        return { ...order, items };
      }),

    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user.id);
    }),

    // Admin: Get all orders
    all: adminProcedure
      .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit || 50;
        const offset = input?.offset || 0;
        return db.getAllOrders(limit, offset);
      }),

    // Admin: Update order status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        return db.updateOrderStatus(input.id, input.status);
      }),
  }),

  // ==================== Report Router ====================
  reports: router({
    getSalesMetrics: adminProcedure
      .input(z.object({
        startDate: z.string(), // Use string for date input from frontend
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return db.getSalesMetrics(startDate, endDate);
      }),

    getInventoryValuation: adminProcedure.query(async () => {
      return db.getInventoryValuation();
    }),
  }),

  // Admin Authentication
  // Extended routers for new entities
  ...extendedRouter,

  admin: router({
    login: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input }) => {
        const admin = await db.getAdminByUsername(input.username);
        if (!admin) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        const passwordMatch = await bcrypt.compare(input.password, admin.passwordHash);
        if (!passwordMatch) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }

        return { success: true, admin: { id: admin.id, username: admin.username, email: admin.email } };
      }),

    changePassword: adminProcedure
      .input(z.object({ currentPassword: z.string(), newPassword: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const admin = await db.getAdminByUsername(ctx.user.name || "");
        if (!admin) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Admin not found" });
        }

        const passwordMatch = await bcrypt.compare(input.currentPassword, admin.passwordHash);
        if (!passwordMatch) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(input.newPassword, 10);
        await db.updateAdminPassword(admin.id, hashedPassword);

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
