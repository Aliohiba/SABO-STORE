import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as dbExt from "./db-mongo-extended";
import { TRPCError } from "@trpc/server";
import mongoose from "mongoose";
import { DarbSabilService } from "./services/darb_sabil";
import { VanexService } from "./services/vanex";
import fs from "fs";
import path from "path";

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
        // Sanitize email to avoid duplicate null key errors
        const customerData = {
          ...input,
          email: input.email || undefined
        };
        return dbExt.createCustomer(customerData as any);
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
      const cities = await dbExt.getAllCities();
      console.log(`[TRPC] Fetched ${cities.length} all cities`);
      return cities;
    }),

    active: publicProcedure.query(async () => {
      const cities = await dbExt.getActiveCities();
      console.log(`[TRPC] Fetched ${cities.length} active cities`);
      return cities;
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return dbExt.getCityById(input.id);
      }),

    getRegions: publicProcedure
      .input(z.object({ cityId: z.string() }))
      .query(async ({ input }) => {
        console.log(`[TRPC] Fetching regions for cityId: ${input.cityId}`);
        const regions = await dbExt.getRegionsByCityId(input.cityId);
        console.log(`[TRPC] Found ${regions.length} regions`);
        return regions;
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

  // ==================== VanexSettings ====================
  vanexSettings: router({
    get: adminProcedure.query(async () => {
      return dbExt.getVanexSetting();
    }),

    update: adminProcedure
      .input(z.object({
        costOnAccount: z.enum(["customer", "store"]).optional(),
        additionalCostOnAccount: z.enum(["customer", "store"]).optional(),
        commissionOnAccount: z.enum(["customer", "store"]).optional(),
        allowInspection: z.boolean().optional(),
        allowMeasurement: z.boolean().optional(),
        isFragile: z.boolean().optional(),
        needsSafePackaging: z.boolean().optional(),
        isHeatSensitive: z.boolean().optional(),
        allow50Note: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        return dbExt.updateVanexSetting(input);
      }),
  }),

  // ==================== Store Settings ====================
  storeSettings: router({
    get: publicProcedure.query(async () => {
      const settings: any = await dbExt.getStoreSettings();
      // Backward compatibility: If featuredProducts exists but featuredSections doesn't, map it
      if (settings &&
        settings.featuredProducts &&
        settings.featuredProducts.length > 0 &&
        (!settings.featuredSections || settings.featuredSections.length === 0)) {

        // Return a modified object structure for the frontend
        return {
          ...(settings.toObject ? settings.toObject() : settings),
          featuredSections: [{
            title: "المنتجات المميزة",
            products: settings.featuredProducts
          }]
        };
      }
      return settings;
    }),

    update: adminProcedure
      .input(z.object({
        storeName: z.string().optional(),
        storeDescription: z.string().optional(),
        storeLogo: z.string().optional(),
        favicon: z.string().optional(),
        banners: z.array(z.string()).optional(),
        featuredSections: z.array(z.object({
          title: z.string(),
          products: z.array(z.string()),
        })).optional(),
        socialMedia: z.object({
          facebook: z.string().optional(),
          twitter: z.string().optional(),
          instagram: z.string().optional(),
          tiktok: z.string().optional(),
          youtube: z.string().optional(),
          whatsapp: z.string().optional(),
          linkedin: z.string().optional(),
        }).optional(),
        footer: z.object({
          aboutText: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          copyright: z.string().optional(),
          paymentText: z.string().optional(),
          quickLinks: z.array(z.object({
            label: z.string(),
            url: z.string(),
          })).optional(),
        }).optional(),
        deliveryProviders: z.object({
          vanex: z.boolean().optional(),
          darb: z.boolean().optional(),
        }).optional(),
        paymentMethods: z.object({
          cash_on_delivery: z.boolean().optional(),
          moamalat: z.boolean().optional(),
          lypay: z.boolean().optional(),
        }).optional(),
        walletSettings: z.object({
          cashbackEnabled: z.boolean().optional(),
          cashbackPercentage: z.number().optional(),
          minOrderValueForCashback: z.number().optional(),
          minProductsCountForCashback: z.number().optional(),
          applyCashbackOn: z.enum(['subtotal', 'total']).optional(),
        }).optional(),
        hideCategoryNames: z.boolean().optional(),
        theme: z.object({
          template: z.enum(['default', 'dark', 'modern']).optional(),
          primaryColor: z.string().optional(),
          secondaryColor: z.string().optional(),
          backgroundColor: z.string().optional(),
          textColor: z.string().optional(),
          headerColor: z.string().optional(),
          footerColor: z.string().optional(),
          buttonRadius: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        const data: any = { ...input };
        if (input.featuredSections) {
          data.featuredSections = input.featuredSections.map((section) => ({
            title: section.title,
            products: section.products.map((id) => new mongoose.Types.ObjectId(id))
          }));
        }
        return dbExt.updateStoreSettings(data);
      }),
  }),


  // ==================== Unified Delivery ====================
  delivery: router({
    providers: publicProcedure.query(async () => {
      // Get settings to check active status
      const settings = await dbExt.getStoreSettings();
      const providersStatus = settings?.deliveryProviders || { vanex: true, darb: true };

      const allProviders = [
        { id: 'vanex', name: 'Vanex', name_ar: 'فانكس', logo: '/vanex-logo.png' },
        { id: 'darb', name: 'Darb Al-Sabeel', name_ar: 'درب السبيل', logo: '/darb-sabil-logo.png' }
      ];

      // Filter based on settings
      // If a provider key is missing in settings, default to true (active)
      return allProviders.filter(p => {
        if (p.id === 'vanex') return providersStatus.vanex !== false;
        if (p.id === 'darb') return providersStatus.darb !== false;
        return true;
      });
    }),

    cities: publicProcedure
      .input(z.object({ providerId: z.string() }))
      .query(async ({ input }) => {
        // Fetch all active cities from unified database
        const cities = await dbExt.getActiveCities();

        // Map to delivery provider format with appropriate price
        const result = cities.map((city: any) => {
          let price = 0;

          if (input.providerId === 'vanex') {
            price = city.deliveryPrice || 0;
          } else if (input.providerId === 'darb') {
            price = city.darbPrice || city.deliveryPrice || 0;
          }

          return {
            id: city.vanexId || city.name,
            name: city.name,
            price: price
          };
        }).filter((city: any) => city.price > 0);

        console.log(`[Delivery] ${input.providerId}: ${result.length} cities`);
        return result;
      }),

    regions: publicProcedure
      .input(z.object({ providerId: z.string(), cityId: z.any() }))
      .query(async ({ input }) => {
        // Find city by ID (could be vanexId or _id or name depending on frontend)
        let city;

        // Try to find by vanexId first (for Vanex)
        if (!isNaN(Number(input.cityId))) {
          city = await dbExt.getAllCities().then((cities: any[]) =>
            cities.find((c: any) => c.vanexId === Number(input.cityId))
          );
        }

        // Fallback: try by MongoDB _id
        if (!city) {
          try {
            city = await dbExt.getCityById(String(input.cityId));
          } catch (e) {
            // Not a valid ObjectId
          }
        }

        // Fallback: try by name (for Darb which uses names)
        if (!city) {
          city = await dbExt.getAllCities().then((cities: any[]) =>
            cities.find((c: any) => c.name === String(input.cityId))
          );
        }

        if (!city) {
          console.warn(`[Delivery] City not found for ID: ${input.cityId}`);
          return [];
        }

        // Fetch regions for this city
        const regions = await dbExt.getRegionsByCityId(city._id.toString());

        // Map to delivery provider format with appropriate price
        return regions.map((region: any) => {
          let price;

          if (input.providerId === 'vanex') {
            price = region.deliveryPrice || undefined;
          } else if (input.providerId === 'darb') {
            price = region.darbPrice || undefined;
          }

          return {
            _id: region._id,
            name: region.name,
            price: price
          };
        });
      }),
  }),

  // ==================== Media Upload ====================
  media: router({
    upload: adminProcedure
      .input(z.object({
        filename: z.string(),
        content: z.string(), // Base64 string
        contentType: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Convert base64 to buffer
          const buffer = Buffer.from(input.content.split(',')[1] || input.content, 'base64');

          // Ensure uploads directory exists
          const uploadsDir = path.join(process.cwd(), "client", "public", "uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          // Generate unique filename
          const timestamp = Date.now();
          const cleanName = input.filename.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\.-]/g, "");
          const finalName = `${timestamp}_${cleanName}`;
          const filePath = path.join(uploadsDir, finalName);

          // Write file
          fs.writeFileSync(filePath, buffer);

          // Return URL path (relative to public folder)
          const publicUrl = `/uploads/${finalName}`;

          return { url: publicUrl };
        } catch (error) {
          console.error("Upload failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload image"
          });
        }
      }),
  }),
});
