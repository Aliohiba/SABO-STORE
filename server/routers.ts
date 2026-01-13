import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, mergeRouters } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db-mongo";
import { VanexService } from "./services/vanex";
import { DarbSabilService } from "./services/darb_sabil";
import { connectMongoDB } from "./mongodb";
import { extendedRouter } from "./routers-extended";
import * as dbExt from "./db-mongo-extended";
import { customerRouter } from "./routers/customer";
import { adminRouter } from "./routers/admin";
import { walletRouter } from "./routers/wallet";
import { sdk } from "./_core/sdk";
import { nanoid } from "nanoid";
import { MoamalatService } from "./services/moamalat";
import { sendEmail, generateOrderConfirmationEmail, generateOrderStatusEmail } from "./services/email";

// تهيئة MongoDB عند بدء التطبيق
connectMongoDB().catch(err => console.error("[MongoDB] Failed to connect:", err));
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { Order, OrderItem, Customer, WalletTransaction, StoreSettings, Product, CartItem, OrderSettings } from "./schemas";
import { City } from "./schemas-extended";
import mongoose from "mongoose";

// Admin procedure that checks for admin role
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Customer procedure that checks for customer role
const customerProcedure = protectedProcedure.use(({ ctx, next }) => {
  // Allow both 'customer' role and customer IDs starting with 'customer_'
  const isCustomer = ctx.user.role === "customer" || ctx.user.id.startsWith("customer_");
  if (!isCustomer) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Customer access required" });
  }
  return next({ ctx });
});



// Helper function to process cashback
const processCashback = async (orderId: string) => {
  console.log(`🔎 Checking Cashback eligibility for Order ${orderId}`);
  try {
    const settingsDoc = await StoreSettings.findOne();
    const settings = settingsDoc ? settingsDoc.toObject() as any : null;

    if (settings?.walletSettings?.cashbackEnabled) {
      let fullOrder = null;
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        fullOrder = await Order.findById(orderId);
      } else {
        fullOrder = await Order.findOne({ orderNumber: orderId });
      }

      if (fullOrder) {
        // Check if Delivered AND Paid
        const isPaid = fullOrder.paymentStatus === 'paid' || (fullOrder as any).isPaid === true;

        if (fullOrder.status === 'delivered' && isPaid) {
          console.log(`📋 Order details: User=${fullOrder.userId}, Total=${fullOrder.totalAmount}, Awarded=${fullOrder.cashbackAwarded}`);

          if (fullOrder.userId && !fullOrder.cashbackAwarded) {
            const minOrderValue = settings.walletSettings.minOrderValueForCashback || 0;
            const minProductsCount = settings.walletSettings.minProductsCountForCashback || 0;
            const cashbackPercentage = settings.walletSettings.cashbackPercentage || 0;

            // Calculate product count
            const orderItems = await OrderItem.find({ orderId: fullOrder._id });
            const productsCount = orderItems.reduce((acc: any, item: any) => acc + (item.quantity || 1), 0);

            const baseAmount = fullOrder.totalAmount;

            console.log(`📊 Cashback Check: 
                - Products Count: ${productsCount} (Min: ${minProductsCount})
                - Amount: ${baseAmount} (Min: ${minOrderValue})
                - Percentage: ${cashbackPercentage}%`);

            if (baseAmount >= minOrderValue && productsCount >= minProductsCount && cashbackPercentage > 0) {
              const cashbackAmount = (baseAmount * cashbackPercentage) / 100;
              console.log(`✅ Eligible! Cashback Amount: ${cashbackAmount}`);

              if (cashbackAmount > 0) {
                const customer = await Customer.findById(fullOrder.userId);
                if (customer) {
                  const balanceBefore = customer.walletBalance || 0;
                  const balanceAfter = balanceBefore + cashbackAmount;

                  customer.walletBalance = balanceAfter;
                  await customer.save();

                  await WalletTransaction.create({
                    customerId: customer._id,
                    type: "cashback",
                    amount: cashbackAmount,
                    balanceBefore,
                    balanceAfter,
                    description: `كاش باك للطلب #${fullOrder.orderNumber}`,
                    referenceId: fullOrder.orderNumber,
                    status: "completed"
                  });

                  fullOrder.cashbackAwarded = true;
                  await fullOrder.save();
                  console.log(`💰 CASHBACK AWARDED SUCCESS: ${cashbackAmount.toFixed(2)} LYD`);
                } else {
                  console.error(`❌ Customer not found for ID: ${fullOrder.userId}`);
                }
              }
            } else {
              console.log("⚠️ Cashback conditions not met.");
            }
          } else {
            console.log("⚠️ Order not eligible (No User ID or Already Awarded)");
          }
        } else {
          console.log(`ℹ️ Order not eligible for cashback yet. Status: ${fullOrder.status}, Paid: ${isPaid} (PaymentMethod: ${fullOrder.paymentMethod})`);
        }
      } else {
        console.error("❌ Order not found during cashback check");
      }
    } else {
      // console.log("ℹ️ Cashback is disabled in settings");
    }
  } catch (err) {
    console.error("❌ Error processing cashback:", err);
  }
};

export const baseRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    // Customer Signup
    signup: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already exists" });
        }

        const passwordHash = await bcrypt.hash(input.password, 10);
        const openId = `local_${nanoid()}`;

        const newUser = await db.createUser({
          openId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          passwordHash,
          loginMethod: "email",
          role: "user",
        });

        // Create session
        const sessionToken = await sdk.createSessionToken(newUser.openId, { name: newUser.name });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        return { success: true, user: newUser };
      }),

    // Customer Login
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const isValid = await bcrypt.compare(input.password, user.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        // Create session
        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        // Update last signed in
        await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

        return { success: true, user };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      console.log("[Auth] Logout request received from:", ctx.user?.id || 'unknown');
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      console.log("[Auth] Cookie cleared.");
      return {
        success: true,
      } as const;
    }),
  }),

  // Products API
  products: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        showActiveOffer: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit || 20;
        const offset = input?.offset || 0;
        const showActiveOffer = input?.showActiveOffer;
        return db.getProducts(limit, offset, showActiveOffer); // Ensure db.getProducts accepts this
      }),

    getById: publicProcedure
      .input(z.object({ id: z.union([z.string(), z.number()]) }))
      .query(async ({ input }) => {
        const productId = typeof input.id === 'number' ? String(input.id) : input.id;
        const product = await db.getProductById(productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        return product;
      }),

    getByIds: publicProcedure
      .input(z.object({ ids: z.array(z.string()) }))
      .query(async ({ input }) => {
        return db.getProductsByIds(input.ids);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return db.searchProducts(input.query, input.limit, input.offset);
      }),

    byCategory: publicProcedure
      .input(z.object({ categoryId: z.union([z.string(), z.number()]), limit: z.number().default(20), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        const categoryId = typeof input.categoryId === 'number' ? String(input.categoryId) : input.categoryId;
        return db.getProductsByCategory(categoryId, input.limit, input.offset);
      }),

    // Admin: Create product
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        productCode: z.string().optional(),
        categoryId: z.union([z.string(), z.number()]), // MongoDB ObjectId string or number
        price: z.number(), // يجب أن يكون number
        originalPrice: z.number().optional(),
        costPrice: z.number().optional(),
        salePrice: z.number().optional(),
        image: z.string().optional(),
        images: z.array(z.string()).optional(),
        stock: z.number().default(0),
        minQuantity: z.number().optional(),
        discount: z.number().optional(),
        active: z.boolean().optional(),
        status: z.enum(["displayed", "hidden"]).default("displayed"),
        tags: z.array(z.string()).optional(),
        options: z.any().optional(), // خيارات المنتج
        offerEndTime: z.union([z.string(), z.date()]).optional(),
        showActiveOffer: z.boolean().optional(),
        lowStockThreshold: z.number().optional(),
        video: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // تحويل categoryId إلى string إذا كان number
        const productData = {
          ...input,
          categoryId: typeof input.categoryId === 'number' ? String(input.categoryId) : input.categoryId,
        };
        return db.createProduct(productData as any);
      }),

    // Admin: Update product
    update: adminProcedure
      .input(z.object({
        id: z.union([z.string(), z.number()]),
        name: z.string().optional(),
        description: z.string().optional(),
        productCode: z.string().optional(),
        categoryId: z.union([z.string(), z.number()]).optional(),
        price: z.union([z.string(), z.number()]).optional(),
        originalPrice: z.union([z.string(), z.number()]).optional(),
        costPrice: z.number().optional(),
        salePrice: z.number().optional(),
        discount: z.number().optional(),
        image: z.string().optional(),
        images: z.array(z.string()).optional(),
        stock: z.number().optional(),
        minQuantity: z.number().optional(),
        status: z.enum(["displayed", "hidden"]).optional(),
        active: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        options: z.any().optional(),
        offerEndTime: z.union([z.string(), z.date()]).optional(),
        showActiveOffer: z.boolean().optional(),
        lowStockThreshold: z.number().optional(),
        video: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const productId = typeof id === "number" ? String(id) : id;
        const updateData = {
          ...data,
          categoryId: data.categoryId ? (typeof data.categoryId === "number" ? String(data.categoryId) : data.categoryId) : undefined,
        };
        return db.updateProduct(productId, updateData as any);
      }),

    // Admin: Get all products (no filter)
    all: adminProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit || 100;
        const offset = input?.offset || 0;
        return db.getAllProducts(limit, offset);
      }),

    // Admin: Delete product
    delete: adminProcedure
      .input(z.object({ id: z.union([z.string(), z.number()]) }))
      .mutation(async ({ input }) => {
        const productId = typeof input.id === 'number' ? String(input.id) : input.id;
        return db.deleteProduct(productId);
      }),
  }),

  // Categories API
  categories: router({
    list: publicProcedure.query(async () => {
      return db.getCategories();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.union([z.string(), z.number()]) }))
      .query(async ({ input }) => {
        const categoryId = typeof input.id === 'number' ? String(input.id) : input.id;
        return db.getCategoryById(categoryId);
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
        id: z.union([z.number(), z.string()]),
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
      .input(z.object({ id: z.union([z.string(), z.number()]) }))
      .mutation(async ({ input }) => {
        const categoryId = typeof input.id === 'number' ? String(input.id) : input.id;
        return db.deleteCategory(categoryId);
      }),
  }),

  // Cart API
  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      console.log("Cart List Query - User:", ctx.user.id);
      const items = await db.getCartItems(ctx.user.id);
      console.log(`Found ${items.length} items for user ${ctx.user.id}`);
      items.forEach(item => console.log("Item:", item._id, "Product:", item.productId, "Populated:", "product" in item ? item.product : "N/A"));
      // Map populated productId to 'product' field for frontend compatibility
      // items are already POJOs due to .lean() in db-mongo
      return items.map((item: any) => {
        // Handle Mongoose document structure if lean() failed
        const rawItem = item._doc || item;
        const productId = rawItem.productId;

        // If productId is populated, it's an object. If not, it's an ID.
        // If it was populated but product is missing (deleted), it might be null or have null properties.

        // We look for 'product' field which might have been set by populate, or 'productId' itself if populate worked in-place
        const potentialProduct = rawItem.product || productId;

        const isValidProduct = potentialProduct && (typeof potentialProduct === 'object') && ('price' in potentialProduct);

        return {
          id: rawItem._id.toString(),
          userId: rawItem.userId ? rawItem.userId.toString() : '',
          quantity: rawItem.quantity,
          product: isValidProduct ? {
            name: potentialProduct.name,
            price: potentialProduct.price,
            image: potentialProduct.image,
            _id: potentialProduct._id ? potentialProduct._id.toString() : '',
          } : {
            _id: productId && typeof productId === 'object' && productId._id ? productId._id.toString() : String(productId || 'unknown'),
            name: "منتج غير متوفر",
            price: 0,
            image: null,
            description: "هذا المنتج لم يعد متوفراً"
          }
        };
      });
    }),

    add: protectedProcedure
      .input(z.object({ productId: z.union([z.string(), z.number()]), quantity: z.number().default(1) }))
      .mutation(async ({ input, ctx }) => {
        const productId = typeof input.productId === 'number' ? String(input.productId) : input.productId;

        const product = await Product.findById(productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
        }

        // Check against existing cart quantity to ensure total doesn't exceed stock
        const userId = typeof ctx.user.id === 'string' && ctx.user.id.startsWith("customer_")
          ? new mongoose.Types.ObjectId(ctx.user.id.replace("customer_", ""))
          : new mongoose.Types.ObjectId(ctx.user.id);

        const existingItem = await CartItem.findOne({
          userId: userId,
          productId: new mongoose.Types.ObjectId(productId)
        });

        const currentQty = existingItem ? existingItem.quantity : 0;
        const newTotalQty = currentQty + input.quantity;

        if (newTotalQty > product.stock) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `عذراً، الكمية المطلوبة غير متوفرة. المتاح حالياً: ${product.stock}`
          });
        }

        return db.addCartItem(ctx.user.id, productId, input.quantity);
      }),

    remove: protectedProcedure
      .input(z.object({ id: z.union([z.string(), z.number()]) }))
      .mutation(async ({ input }) => {
        const itemId = typeof input.id === 'number' ? String(input.id) : input.id;
        return db.removeCartItem(itemId);
      }),

    updateQuantity: protectedProcedure
      .input(z.object({ id: z.union([z.string(), z.number()]), quantity: z.number() }))
      .mutation(async ({ input }) => {
        const itemId = typeof input.id === 'number' ? String(input.id) : input.id;

        const cartItem = await CartItem.findById(itemId);
        if (!cartItem) {
          throw new TRPCError({ code: "NOT_FOUND", message: "عنصر السلة غير موجود" });
        }

        const product = await Product.findById(cartItem.productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المنتج غير موجود" });
        }

        if (input.quantity > product.stock) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `عذراً، الكمية المطلوبة غير متوفرة. المتاح حالياً: ${product.stock}`
          });
        }

        return db.updateCartItemQuantity(itemId, input.quantity);
      }),

    clear: protectedProcedure.mutation(async ({ ctx }) => {
      return db.clearCart(ctx.user.id);
    }),
  }),

  // Orders API
  orders: router({
    create: publicProcedure
      .input(z.object({
        customerName: z.string().optional(),
        customerEmail: z.union([
          z.string().email(),
          z.literal(""),
          z.undefined()
        ]).optional(),
        customerPhone: z.string().optional(),
        customerAddress: z.string().optional(),
        cityId: z.union([z.number(), z.string()]).optional(),
        items: z.array(z.object({
          productId: z.union([z.string(), z.number()]),
          quantity: z.number(),
        })),
        paymentMethod: z.string().default("cash_on_delivery"),
        notes: z.string().optional(),
        deliveryCompanyId: z.string().optional(),
        area: z.string().optional(),
        useWalletPartial: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const orderNumber = `ORD-${Date.now()}`;

        // Extract ObjectId from customer_ prefix if present
        let userId = ctx.user?.id;
        if (userId && String(userId).startsWith("customer_")) {
          userId = String(userId).replace("customer_", "");
        }

        // --- Resolve Customer Info (Source of Truth: DB for Customers) ---
        let { customerName, customerPhone, customerEmail, customerAddress, cityId, area } = input;

        if (userId) {
          const customer = await Customer.findById(userId);
          if (customer) {
            // Enforce identity from DB
            customerName = customer.name;
            customerPhone = customer.phone;
            customerEmail = customer.email;

            // Allow overrides for Address/City only if provided (e.g. Pickup Store Address)
            // Otherwise default to DB Profile
            customerAddress = customerAddress || customer.address;
            cityId = cityId || customer.cityId;
            area = area || customer.area;
          }
        } else {
          // GUEST CHECKOUT - Auto Register/Link Logic
          if (customerPhone) {
            // 1. Check if customer exists by phone
            let customer = await Customer.findOne({ phone: customerPhone });

            if (!customer) {
              // 2. Create new customer "silently"
              console.log(`[Order] Creating new customer account for Guest: ${customerName} (${customerPhone})`);

              // Generate random password
              const randomPassword = nanoid(10);
              const salt = await bcrypt.genSalt(10);
              const passwordHash = await bcrypt.hash(randomPassword, salt);

              // Generate Unique Wallet Number
              const walletNumber = `WAL-${nanoid(8).toUpperCase()}`;

              try {
                customer = await Customer.create({
                  name: customerName,
                  phone: customerPhone,
                  email: customerEmail || undefined, // Sparse index handles undefined
                  passwordHash,
                  cityId,
                  area,
                  address: customerAddress,
                  walletNumber,
                  isActive: true, // Active by default
                  walletBalance: 0
                });
                console.log(`[Order] New Customer Created: ${customer._id}`);
              } catch (err: any) {
                // Handle race condition or duplicate key error gracefully
                if (err.code === 11000) {
                  console.log("[Order] Customer creation race condition detected, fetching existing...");
                  customer = await Customer.findOne({ phone: customerPhone });
                } else {
                  console.error("[Order] Failed to auto-create customer:", err);
                  // Fallback: Proceed without linking (though this shouldn't happen often)
                }
              }
            }

            if (customer) {
              userId = customer._id.toString();
              // If existing customer, we MIGHT want to update their address/city if they provided new ones?
              // For now, let's keep the order linked but respect their profile data for the order itself
              // if we want the order to reflect the typed inputs.
              // BUT, generally for "auto-login" next time, we rely on the DB.

              // Let's decide: The order record should preserve what was TYPED in this checkout (input), 
              // but the USER identity is linked.
            }
          }
        }

        // Validate Requirements
        if (!customerName) throw new TRPCError({ code: "BAD_REQUEST", message: "الاسم مطلوب" });
        if (!customerPhone) throw new TRPCError({ code: "BAD_REQUEST", message: "رقم الهاتف مطلوب" });

        // --- Recalculate Prices & Total (Security Fix) ---
        let subTotal = 0;
        const finalItems = [];

        // Verify products and prices
        for (const item of input.items) {
          const productId = String(item.productId);
          const product = await db.getProductById(productId);

          if (!product) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Product not found: ${productId}` });
          }

          // Check Stock
          if (product.stock < item.quantity) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `الكمية المطلوبة غير متوفرة للمنتج: ${product.name} (المتوفر: ${product.stock})` });
          }

          // Use salePrice if active (assuming valid if > 0)
          const itemPrice = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;

          subTotal += itemPrice * item.quantity;

          finalItems.push({
            productId: productId,
            productName: product.name,
            quantity: item.quantity,
            price: itemPrice // Authoritative price
          });
        }

        // --- Calculate Shipping ---
        let shippingCost = 0;
        const provider = input.deliveryCompanyId || 'vanex';

        if (cityId) {
          // Fetch all cities (cached/fast enough) to find by ID or Name
          const allCities = await dbExt.getAllCities();
          let city: any = allCities.find(c => String(c._id) === String(cityId));

          if (!city && typeof cityId === 'number') {
            city = allCities.find(c => c.vanexId === cityId);
          }
          if (!city) {
            city = allCities.find(c => c.name === String(cityId));
          }

          if (city) {
            // Determine Base Price
            let price = (provider === 'darb') ? (city.darbPrice || city.deliveryPrice) : city.deliveryPrice;

            // Region Override
            if (area) {
              try {
                const regions = await dbExt.getRegionsByCityId(String(city._id));
                const region = regions.find(r => r.name === area);
                if (region) {
                  if (provider === 'darb' && region.darbPrice) price = region.darbPrice;
                  else if (provider === 'vanex' && region.deliveryPrice) price = region.deliveryPrice;
                }
              } catch (e) {
                // Ignore region errors
              }
            }
            shippingCost = price || 0;
          }
        }

        const finalTotal = subTotal; // Shipping is for info only, not included in invoice total

        let isPaid = false;
        let finalPaymentMethod = input.paymentMethod;
        let paymentDetails: any = {};

        // --- Wallet Logic ---
        if (userId && (input.useWalletPartial || input.paymentMethod === 'wallet')) {
          const customer = await Customer.findById(userId);
          if (customer) {
            const balance = customer.walletBalance || 0;
            let deduction = 0;

            if (input.paymentMethod === 'wallet' && !input.useWalletPartial) {
              if (balance < finalTotal) throw new TRPCError({ code: "BAD_REQUEST", message: "رصيد المحفظة غير كافٍ" });
              deduction = finalTotal;
              finalPaymentMethod = 'wallet';
              isPaid = true;
            } else if (input.useWalletPartial && balance > 0) {
              deduction = Math.min(balance, finalTotal);
              if (deduction >= finalTotal) {
                finalPaymentMethod = 'wallet';
                isPaid = true;
              }
            }

            if (deduction > 0) {
              const newBalance = balance - deduction;
              customer.walletBalance = newBalance;
              await customer.save();

              await WalletTransaction.create({
                customerId: userId,
                type: "payment",
                amount: deduction,
                balanceBefore: balance,
                balanceAfter: newBalance,
                description: `دفع طلب #${orderNumber}`,
                referenceId: orderNumber,
                status: "completed"
              });

              paymentDetails = {
                walletPaid: deduction,
                walletDeducted: true,
                remainingAmount: finalTotal - deduction,
                originalMethod: input.paymentMethod
              };
            }
          }
        }

        // --- Normalize Phone (Apply same logic as Darb Service) ---
        if (customerPhone) {
          let rawPhone = String(customerPhone).trim();
          let cleanPhone = rawPhone.replace(/[^0-9+]/g, "");
          if (cleanPhone.startsWith("00")) cleanPhone = "+" + cleanPhone.substring(2);
          else if (cleanPhone.startsWith("0")) cleanPhone = "+218" + cleanPhone.substring(1);
          else if (cleanPhone.startsWith("218")) cleanPhone = "+" + cleanPhone;
          else if (!cleanPhone.startsWith("+") && cleanPhone.length === 9) cleanPhone = "+218" + cleanPhone;

          customerPhone = cleanPhone;
        }

        // --- Generate Unique Tracking Key ---
        const trackingKey = `TRK-${nanoid(12).toUpperCase()}`;

        // --- Create Order ---
        const order = await db.createOrder({
          orderNumber,
          trackingKey,
          customerName, // Use resolved name
          customerEmail,
          customerPhone,
          customerAddress,
          totalAmount: finalTotal as any, // Use Calculated Total
          paymentMethod: finalPaymentMethod,
          notes: input.notes,
          userId: userId,
          cityId, // Use resolved cityId
          deliveryCompanyId: input.deliveryCompanyId,
          area, // Use resolved area
          shippingCost,
          status: "pending",
          isPaid,
          paymentDetails
        } as any);

        if (order) {
          const insertId = (order as any).insertId || (order as any).id;
          // Use FinalItems (Authenticated Prices)
          for (const item of finalItems) {
            // Create Order Item
            await db.createOrderItem({
              orderId: insertId || 1,
              productId: String(item.productId),
              productName: item.productName,
              quantity: item.quantity,
              price: Number(item.price),
            });

            // Deduct Stock (Ensure ObjectId)
            try {
              const pId = new mongoose.Types.ObjectId(String(item.productId));
              await Product.findByIdAndUpdate(pId, { $inc: { stock: -item.quantity } });
              console.log(`Stocks deducted for product ${item.productId} (-${item.quantity})`);
            } catch (err) {
              console.error(`Failed to deduct stock for product ${item.productId}`, err);
            }
          }
        }

        // Clear cart for both logged-in users and guests after successful order creation
        if (ctx.user?.id) {
          try {
            await db.clearCart(ctx.user.id);
            console.log(`Cart cleared for user ${ctx.user.id} after order creation`);
          } catch (err) {
            console.error(`Failed to clear cart for user ${ctx.user.id}:`, err);
          }
        }

        // Send order confirmation email
        if (customerEmail && order) {
          const orderItems = finalItems.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: Number(item.price)
          }));

          sendEmail({
            to: customerEmail,
            subject: `تأكيد الطلب #${orderNumber} - متجر سابو`,
            html: generateOrderConfirmationEmail(
              orderNumber,
              trackingKey,
              customerName || 'العميل',
              finalTotal,
              orderItems
            )
          }).catch(err => console.error('Email error:', err));
        }

        return order;
      }),



    getById: publicProcedure
      .input(z.object({ id: z.union([z.string(), z.number()]) }))
      .query(async ({ input }) => {
        const orderId = typeof input.id === 'number' ? String(input.id) : input.id;
        const order = await db.getOrderById(orderId);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }
        const items = await db.getOrderItems(orderId);
        return { ...order, items };
      }),

    // Public: Track order by tracking key (no authentication required)
    trackByKey: publicProcedure
      .input(z.object({ trackingKey: z.string() }))
      .query(async ({ input }) => {
        const order = await Order.findOne({ trackingKey: input.trackingKey });
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found with this tracking key" });
        }

        // Fetch order items
        const orderItems = await OrderItem.find({ orderId: order._id }).populate('productId');

        // Return order data (sanitized for public access)
        return {
          orderNumber: order.orderNumber,
          trackingKey: order.trackingKey,
          status: order.status,
          createdAt: order.createdAt,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          isPaid: order.isPaid,
          trackingCode: order.trackingCode,
          deliveryCompanyId: order.deliveryCompanyId,
          shippingCost: order.shippingCost,
          items: orderItems.map((item: any) => ({
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            image: item.productId?.image || null,
          })),
        };
      }),

    myOrders: customerProcedure.query(async ({ ctx }) => {
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

    // Admin: Toggle payment status
    togglePaymentStatus: adminProcedure
      .input(z.object({
        id: z.union([z.string(), z.number()]),
        isPaid: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const orderId = typeof input.id === 'number' ? String(input.id) : input.id;
        await db.updateOrderPaymentStatus(orderId, input.isPaid, { manuallyUpdatedBy: 'admin', date: new Date() });

        // Trigger Cashback check if marked as Paid
        if (input.isPaid) {
          await processCashback(orderId);
        }

        return { success: true };
      }),

    // Admin: Update order status
    updateStatus: adminProcedure
      .input(z.object({
        id: z.union([z.string(), z.number()]),
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        const orderId = typeof input.id === 'number' ? String(input.id) : input.id;

        // --- Status Transition Validation ---
        const existingOrder = await db.getOrderById(orderId);
        if (!existingOrder) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        }

        const statusRank: Record<string, number> = {
          "pending": 0,
          "confirmed": 1,
          "shipped": 2,
          "delivered": 3,
          "cancelled": 99 // Cancelled is special
        };

        const currentRank = statusRank[existingOrder.status] ?? 0;
        const newRank = statusRank[input.status] ?? 0;

        // Prevent going backward (unless cancelling, or if currently cancelled - actually usually you don't un-cancel easily but let's stick to the request "do not return to previous stage")
        // Request: "First case wait (pending), second confirm, third shipped, fourth delivered. I do not want to return to any case for the stage before it"

        if (input.status !== "cancelled" && existingOrder.status !== "cancelled") {
          if (newRank < currentRank) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "لا يمكن الرجوع إلى حالة سابقة"
            });
          }
        }
        // If currently cancelled, maybe allow re-opening? The user didn't specify. Assuming "do not return" applies to the main flow. 
        // If we are cancelled (99), any main status (0-3) is technically "backward" in rank logic if we treated 99 as high, but conceptually it's "re-opening".
        // Let's strictly follow "do not return to previous stage" for the main flow.

        // Update status
        const updated = await db.updateOrderStatus(orderId, input.status);

        // If status is confirmed, trigger delivery creation if applicable
        if (input.status === "confirmed") {
          const order = await db.getOrderById(orderId);
          const fullOrder = order as any;
          console.log(`📦 Order ${orderId} confirmed. Provider: ${fullOrder.deliveryCompanyId || 'default/vanex'}`);

          // Determine Provider
          const provider = fullOrder.deliveryCompanyId || 'vanex';

          if (provider === 'vanex') {
            // ... existing Vanex Logic ...
            console.log("Checking Vanex requirements...");
            if (fullOrder.cityId) {
              try {
                const vanexData = {
                  customerName: fullOrder.customerName,
                  customerPhone: fullOrder.customerPhone,
                  cityId: fullOrder.cityId,
                  address: fullOrder.customerAddress || "لا يوجد عنوان محدد",
                  totalPrice: fullOrder.isPaid ? 0 : parseFloat(String(fullOrder.totalAmount)),
                  note: `${fullOrder.notes || ''} [Order: ${fullOrder.orderNumber}]`
                };

                console.log("🚀 Sending to Vanex:", vanexData);
                const shipment = await VanexService.createOrder(vanexData);
                console.log("✅ Vanex response:", shipment);

                if (shipment && shipment.trackingNumber) {
                  await db.updateOrderTracking(orderId, shipment.trackingNumber, String(shipment.vanexId));
                  console.log("✅ Vanex Shipment Created & Saved:", shipment.trackingNumber);
                }
              } catch (err) {
                console.error("❌ Failed to create Vanex shipment:", err);
              }
            } else {
              console.log("⚠️ Order confirmed but missing cityId for Vanex.");
            }

          } else if (provider === 'darb') {
            // ... Darb Al-Sabeel Logic ...
            console.log("Checking Darb Al-Sabeel requirements...");
            try {
              // Darb expects specific payload structure matching V2 Service
              // Resolve City Name
              // Resolve City Name
              let cityName = "";
              if (fullOrder.cityId) {
                if (mongoose.Types.ObjectId.isValid(String(fullOrder.cityId))) {
                  const cityDoc = await City.findById(fullOrder.cityId);
                  if (cityDoc) cityName = cityDoc.name;
                } else {
                  // If it's not an ObjectId, it might be a Vanex ID (number) or just the name
                  const cityDoc = await City.findOne({ $or: [{ vanexId: Number(fullOrder.cityId) }, { name: String(fullOrder.cityId) }] });
                  if (cityDoc) cityName = cityDoc.name;
                  else cityName = String(fullOrder.cityId);
                }
              }

              // Resolve Area Name (if it's an ID)
              let areaName = fullOrder.area;
              if (areaName && mongoose.Types.ObjectId.isValid(areaName)) {
                // It's likely an ID, try to find it in Region or fallback
                // Since Region schema has name and cityId, we can try finding by ID if we had a Region model with ID, 
                // but Region usually uses _id.
                // Let's try to query Region by _id
                const mongoose = await import("mongoose");
                const { Region } = await import("./schemas-extended");
                try {
                  const regionDoc = await Region.findById(areaName);
                  if (regionDoc) areaName = regionDoc.name;
                } catch (e) { /* ignore */ }
              }

              // Address Format: "Area, City" or fallback to existing logic
              let formattedAddress = fullOrder.customerAddress || "Address";
              if (areaName && cityName) {
                if (cityName.includes("بنغازي")) {
                  formattedAddress = cityName;
                } else {
                  formattedAddress = `${areaName}, ${cityName}`;
                  // Append original details if available and different
                  if (fullOrder.customerAddress && fullOrder.customerAddress !== areaName) {
                    formattedAddress += ` - ${fullOrder.customerAddress}`;
                  }
                }
              } else if (cityName) {
                formattedAddress += ` - ${cityName}`;
              }

              const darbData = {
                orderNumber: fullOrder.orderNumber,
                customerName: fullOrder.customerName,
                customerPhone: fullOrder.customerPhone,
                customerEmail: fullOrder.customerEmail,
                address: formattedAddress,
                cityId: cityName, // Pass the Resolved Name as 'cityId' because Service uses it as 'city' name
                area: areaName,   // Pass Resolved Name
                amount: fullOrder.isPaid ? 0 : parseFloat(String(fullOrder.totalAmount)),
                comment: `${fullOrder.notes || ''} [Order: ${fullOrder.orderNumber}]`
              };

              console.log("🚀 Sending to Darb Sabil:", darbData);
              const shipment = await DarbSabilService.createOrder(darbData);
              console.log("✅ Darb Sabil response:", shipment);

              // V2 Response structure: { status: true, data: { _id: "...", reference: "..." } }
              if (shipment && shipment.status && shipment.data && (shipment.data._id || shipment.data.id)) {
                const trackingCode = shipment.data.reference || String(shipment.data._id || shipment.data.id);
                await db.updateOrderTracking(orderId, trackingCode, String(shipment.data._id || shipment.data.id));
                console.log("✅ Darb Sabil Shipment Created:", trackingCode);
              } else {
                console.error("❌ Darb Sabil response missing expected data format:", shipment);
              }

            } catch (err) {
              console.error("❌ Failed to create Darb Sabil shipment:", err);
            }
          }
        }


        // Cashback Logic
        if (input.status === "delivered" && updated) {
          await processCashback(orderId);
        }

        // Send status update email
        if (updated && existingOrder.customerEmail && input.status !== existingOrder.status) {
          const statusArabic: Record<string, string> = {
            pending: 'قيد الانتظار',
            confirmed: 'مؤكد',
            shipped: 'مشحون',
            delivered: 'تم التسليم',
            cancelled: 'ملغى'
          };

          sendEmail({
            to: existingOrder.customerEmail,
            subject: `تحديث حالة الطلب #${existingOrder.orderNumber} - متجر سابو`,
            html: generateOrderStatusEmail(
              existingOrder.orderNumber,
              existingOrder.trackingKey,
              existingOrder.customerName || 'العميل',
              input.status,
              statusArabic[input.status] || input.status
            )
          }).catch(err => console.error('Failed to send status email:', err));
        }

        return updated;
      }),



    // Admin: Update order details
    update: adminProcedure
      .input(z.object({
        id: z.string(),
        customerName: z.string().optional(),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
        customerAddress: z.string().optional(),
        cityId: z.union([z.number(), z.string()]).optional(),
        notes: z.string().optional(),
        items: z.array(z.object({
          productId: z.string(),
          productName: z.string(),
          quantity: z.number(),
          price: z.number(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, items, ...updateData } = input;

        const order = await db.getOrderById(id);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found"
          });
        }

        // If items are provided, update order items and recalculate total
        if (items && items.length > 0) {
          const orderObjectId = order._id;

          // Delete existing order items
          await OrderItem.deleteMany({ orderId: orderObjectId });

          // Create new order items
          const itemPromises = items.map(item =>
            db.createOrderItem({
              orderId: orderObjectId,
              productId: new mongoose.Types.ObjectId(item.productId),
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
            })
          );
          await Promise.all(itemPromises);

          // Recalculate total amount
          const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          updateData.totalAmount = totalAmount as any;
        }

        // Update order with new data
        const updated = await Order.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
        ).lean().exec();

        return updated;
      }),

    // Delete order (Admin only)
    delete: adminProcedure
      .input(z.object({ id: z.union([z.string(), z.number()]) }))
      .mutation(async ({ input }) => {
        const id = typeof input.id === 'number' ? String(input.id) : input.id;

        const order = await Order.findByIdAndDelete(id);
        if (!order) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' });
        }

        // Also delete associated order items
        await OrderItem.deleteMany({ orderId: new mongoose.Types.ObjectId(id) });

        return { success: true };
      }),

    // Delete multiple orders (Admin only)
    deleteMany: adminProcedure
      .input(z.object({ ids: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        const objectIds = input.ids.map(id => new mongoose.Types.ObjectId(id));

        // Delete orders
        const result = await Order.deleteMany({ _id: { $in: objectIds } });

        // Delete associated order items
        await OrderItem.deleteMany({ orderId: { $in: objectIds } });

        return { success: true, deletedCount: result.deletedCount };
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

    getDetailedSalesReport: adminProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        return db.getDetailedSalesReport(startDate, endDate);
      }),
  }),

  // ==================== VANEX Router ====================
  vanex: router({
    cities: publicProcedure.query(async () => {
      return VanexService.getCities();
    }),
    regions: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ input }) => {
        return VanexService.getRegions(input.cityId);
      }),
    calculatePrice: publicProcedure
      .input(z.object({ cityId: z.number() }))
      .query(async ({ input }) => {
        return VanexService.getDeliveryPrice(input.cityId);
      }),
    createOrder: publicProcedure
      .input(z.object({
        customerName: z.string(),
        customerPhone: z.string(),
        cityId: z.number(),
        address: z.string(),
        totalPrice: z.number(),
        note: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return VanexService.createOrder(input);
      }),
    track: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return VanexService.getTracking(input.code);
      }),

    getShipments: adminProcedure
      .input(z.object({ page: z.number().default(1) }))
      .query(async ({ input }) => {
        return VanexService.getShipments(input.page);
      }),
  }),

  // ==================== Darb Sabil Router ====================
  darbSabil: router({
    cities: publicProcedure.query(async () => {
      // Return cities with 'price' field
      return DarbSabilService.getCities();
    }),
    createOrder: publicProcedure
      .input(z.object({
        // Minimal schema for testing
        orderData: z.any()
      }))
      .mutation(async ({ input }) => {
        return DarbSabilService.createOrder(input.orderData);
      }),
    track: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return DarbSabilService.getTracking(input.code);
      }),
    getShipments: adminProcedure
      .input(z.object({ page: z.number().default(1) }))
      .query(async ({ input }) => {
        return DarbSabilService.getShipments(input.page);
      }),
  }),

  // ==================== Moamalat Router ====================
  moamalat: router({
    initiatePayment: publicProcedure
      .input(z.object({
        amount: z.number(), // Input amount as number
        orderId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { amount, orderId } = input;

        // Convert to Milli-units (Dirhams) for LYD (1 LYD = 1000 Dirhams)
        // This removes decimals which are often rejected by gateways expecting integer strings
        const amountMilli = Math.floor(amount * 1000);
        const finalAmount = String(amountMilli);

        // Append timestamp to orderId to ensure unique MerchantReference for every attempt
        // This prevents "Duplicate Transaction" errors if the user retries the same order
        const uniqueRef = `${orderId}-${Date.now()}`;

        console.log(`[Moamalat] Initiating payment for Order ${orderId}`);
        console.log(`[Moamalat] Amount: ${amount} LYD -> ${finalAmount} Dirhams`);
        console.log(`[Moamalat] MerchantRef: ${uniqueRef}`);

        const dateTime = MoamalatService.generateDateTime();
        const config = MoamalatService.getConfig();

        // Generate hash with the milli-unit amount and unique reference
        const hash = MoamalatService.generateRequestHash(finalAmount, dateTime, uniqueRef);

        return {
          mid: config.merchantId,
          tid: config.terminalId,
          amountTrxn: finalAmount,
          merchantReference: uniqueRef,
          trxDateTime: dateTime,
          secureHash: hash,
        };
      }),

    verifyTransaction: publicProcedure
      .input(z.object({ merchantReference: z.string() }))
      .mutation(async ({ input }) => {
        const result = await MoamalatService.verifyTransaction(input.merchantReference);
        return result;
      }),

    confirmPayment: publicProcedure
      .input(z.object({
        orderId: z.string(),
        transaction: z.any().optional(),
      }))
      .mutation(async ({ input }) => {
        const { orderId, transaction } = input;
        console.log(`[Moamalat] Confirming payment for order ${orderId}`, transaction);

        // Update order status to PAID
        await db.updateOrderPaymentStatus(orderId, true, transaction);

        return { success: true };
      }),
  }),




  // ==================== Admin Users Management Router ====================
  adminUsers: router({
    // Get all admin users
    list: adminProcedure.query(async () => {
      return db.getAllAdminUsers();
    }),

    // Get admin user by ID
    getById: adminProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        const admin = await db.getAdminById(input.id);
        if (!admin) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Admin user not found" });
        }
        return admin;
      }),

    // Create new admin user
    create: adminProcedure
      .input(z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        email: z.string().email().optional(),
        name: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        // Check if username already exists
        const existing = await db.getAdminByUsername(input.username);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "اسم المستخدم موجود بالفعل" });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(input.password, 10);

        // Create admin user
        return db.createAdminUser({
          username: input.username,
          passwordHash,
          email: input.email,
          name: input.name,
          isActive: input.isActive,
        });
      }),

    // Update admin user
    update: adminProcedure
      .input(z.object({
        id: z.string(),
        username: z.string().min(3).optional(),
        email: z.string().email().optional(),
        name: z.string().optional(),
        isActive: z.boolean().optional(),
        password: z.string().min(6).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, password, ...updateData } = input;

        // If username is being updated, check for conflicts
        if (updateData.username) {
          const existing = await db.getAdminByUsername(updateData.username);
          if (existing && existing._id.toString() !== id) {
            throw new TRPCError({ code: "CONFLICT", message: "اسم المستخدم موجود بالفعل" });
          }
        }

        // If password is provided, hash it
        if (password) {
          const passwordHash = await bcrypt.hash(password, 10);
          return db.updateAdminUser(id, { ...updateData, passwordHash });
        }

        return db.updateAdminUser(id, updateData);
      }),

    // Delete admin user
    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        const admin = await db.getAdminById(input.id);
        if (!admin) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Admin user not found" });
        }
        return db.deleteAdminUser(input.id);
      }),
  }),

  // Order Settings
  orderSettings: router({
    // Get order settings
    get: publicProcedure.query(async () => {
      let settings = await OrderSettings.findOne();
      if (!settings) {
        // Create default settings if they don't exist
        settings = await OrderSettings.create({});
      }
      return settings;
    }),

    // Update order settings (admin only)
    update: adminProcedure
      .input(z.object({
        autoAcceptOrders: z.boolean().optional(),
        allowPartialPaymentCash: z.boolean().optional(),
        allowPartialPaymentElectronic: z.boolean().optional(),
        preferredDeliveryCompany: z.string().optional(),
        showDeliveryPriceBeforeCheckout: z.boolean().optional(),
        showBackupPhoneField: z.boolean().optional(),
        showEmailField: z.boolean().optional(),
        showSubscribeButton: z.boolean().optional(),
        defaultPaymentMethod: z.enum(["cash", "immediate"]).optional(),
      }))
      .mutation(async ({ input }) => {
        let settings = await OrderSettings.findOne();
        if (!settings) {
          settings = await OrderSettings.create(input);
        } else {
          Object.assign(settings, input);
          await settings.save();
        }
        return settings;
      }),
  }),

  // Customer authentication
  customer: customerRouter,
  admin: adminRouter,
  wallet: walletRouter,
});

export const appRouter = mergeRouters(baseRouter, extendedRouter);


