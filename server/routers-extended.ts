import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as dbExt from "./db-mongo-extended";
import { TRPCError } from "@trpc/server";

// Admin procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const extendedRouter = router({
  // ==================== Customers ====================
  customers: router({
    list: publicProcedure.query(async () => {
      return dbExt.getAllCustomers();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getCustomerById(input.id);
      }),

    getByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        return dbExt.getCustomerByEmail(input.email);
      }),

    create: publicProcedure
      .input(z.object({
        fullName: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return dbExt.createCustomer(input as any);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return dbExt.updateCustomer(id, data as any);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return dbExt.deleteCustomer(input.id);
      }),
  }),

  // ==================== Cities ====================
  cities: router({
    list: publicProcedure.query(async () => {
      return dbExt.getAllCities();
    }),

    active: publicProcedure.query(async () => {
      return dbExt.getActiveCities();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getCityById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string(),
        deliveryPrice: z.number(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return dbExt.createCity(input as any);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        deliveryPrice: z.number().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return dbExt.updateCity(id, data as any);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return dbExt.deleteCity(input.id);
      }),
  }),

  // ==================== DeliveryCompanies ====================
  deliveryCompanies: router({
    list: publicProcedure.query(async () => {
      return dbExt.getAllDeliveryCompanies();
    }),

    active: publicProcedure.query(async () => {
      return dbExt.getActiveDeliveryCompanies();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getDeliveryCompanyById(input.id);
      }),

    create: adminProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string().optional(),
        apiUrl: z.string().optional(),
        apiKey: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return dbExt.createDeliveryCompany(input as any);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        phone: z.string().optional(),
        apiUrl: z.string().optional(),
        apiKey: z.string().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return dbExt.updateDeliveryCompany(id, data as any);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return dbExt.deleteDeliveryCompany(input.id);
      }),
  }),

  // ==================== ProductImages ====================
  productImages: router({
    getByProduct: publicProcedure
      .input(z.object({ productId: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getProductImages(input.productId);
      }),

    getMainImage: publicProcedure
      .input(z.object({ productId: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getMainProductImage(input.productId);
      }),

    create: adminProcedure
      .input(z.object({
        productId: z.string(),
        imageUrl: z.string(),
        isMain: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return dbExt.createProductImage(input as any);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.string(),
        imageUrl: z.string().optional(),
        isMain: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return dbExt.updateProductImage(id, data as any);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return dbExt.deleteProductImage(input.id);
      }),
  }),

  // ==================== ProductOptions ====================
  productOptions: router({
    list: publicProcedure.query(async () => {
      return dbExt.getAllProductOptions();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getProductOption(input.id);
      }),

    getByType: publicProcedure
      .input(z.object({ type: z.enum(["COLOR", "SIZE", "OTHER"]) }))
      .query(async ({ input }) => {
        return dbExt.getProductOptionsByType(input.type);
      }),

    create: adminProcedure
      .input(z.object({
        type: z.enum(["COLOR", "SIZE", "OTHER"]),
        value: z.string(),
      }))
      .mutation(async ({ input }) => {
        return dbExt.createProductOption(input as any);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.string(),
        type: z.enum(["COLOR", "SIZE", "OTHER"]).optional(),
        value: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return dbExt.updateProductOption(id, data as any);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return dbExt.deleteProductOption(input.id);
      }),
  }),

  // ==================== Shipments ====================
  shipments: router({
    list: publicProcedure.query(async () => {
      return dbExt.getAllShipments();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getShipmentById(input.id);
      }),

    getByOrder: publicProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getShipmentByOrderId(input.orderId);
      }),

    getByTracking: publicProcedure
      .input(z.object({ trackingNumber: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getShipmentByTrackingNumber(input.trackingNumber);
      }),

    create: adminProcedure
      .input(z.object({
        orderId: z.string(),
        deliveryCompanyId: z.string().optional(),
        trackingNumber: z.string().optional(),
        shippingPrice: z.number().optional(),
        estimatedDeliveryDate: z.date().optional(),
        status: z.enum(["PENDING", "IN_TRANSIT", "DELIVERED", "CANCELLED"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return dbExt.createShipment(input as any);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.string(),
        trackingNumber: z.string().optional(),
        shippingPrice: z.number().optional(),
        estimatedDeliveryDate: z.date().optional(),
        actualDeliveryDate: z.date().optional(),
        status: z.enum(["PENDING", "IN_TRANSIT", "DELIVERED", "CANCELLED"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return dbExt.updateShipment(id, data as any);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return dbExt.deleteShipment(input.id);
      }),
  }),

  // ==================== OrderTracking ====================
  orderTracking: router({
    getByOrder: publicProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getOrderTrackings(input.orderId);
      }),

    getLatest: publicProcedure
      .input(z.object({ orderId: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getLatestOrderTracking(input.orderId);
      }),

    create: adminProcedure
      .input(z.object({
        orderId: z.string(),
        status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
        note: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return dbExt.createOrderTracking(input as any);
      }),

    update: adminProcedure
      .input(z.object({
        id: z.string(),
        status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
        note: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return dbExt.updateOrderTracking(id, data as any);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return dbExt.deleteOrderTracking(input.id);
      }),
  }),
});
