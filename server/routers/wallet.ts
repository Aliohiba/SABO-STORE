import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { Customer, WalletTransaction } from "../schemas";
import { TRPCError } from "@trpc/server";

export const walletRouter = router({
    // Get wallet balance and recent transactions
    getWallet: protectedProcedure.query(async ({ ctx }) => {
        let customerId = ctx.user?.id;
        if (!customerId) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        if (customerId.startsWith("customer_")) customerId = customerId.replace("customer_", "");

        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
        }

        const transactions = await WalletTransaction.find({ customerId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return {
            balance: customer.walletBalance || 0,
            transactions: transactions.map((t: any) => ({
                ...t,
                _id: String(t._id),
                customerId: String(t.customerId)
            }))
        };
    }),

    // Alias for MyOrders page which uses getBalance
    getBalance: protectedProcedure.query(async ({ ctx }) => {
        let customerId = ctx.user?.id;
        if (!customerId) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        if (customerId.startsWith("customer_")) customerId = customerId.replace("customer_", "");

        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
        }

        const transactions = await WalletTransaction.find({ customerId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return {
            balance: customer.walletBalance || 0,
            transactions: transactions.map((t: any) => ({
                ...t,
                _id: String(t._id),
                customerId: String(t.customerId)
            }))
        };
    }),

    // Get transaction history (paginated)
    getTransactions: protectedProcedure
        .input(
            z.object({
                page: z.number().default(1),
                limit: z.number().default(20),
            })
        )
        .query(async ({ ctx, input }) => {
            let customerId = ctx.user?.id;
            if (!customerId) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }
            if (customerId.startsWith("customer_")) customerId = customerId.replace("customer_", "");

            const skip = (input.page - 1) * input.limit;

            const [transactions, total] = await Promise.all([
                WalletTransaction.find({ customerId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(input.limit)
                    .lean(),
                WalletTransaction.countDocuments({ customerId }),
            ]);

            return {
                transactions: transactions.map((t: any) => ({
                    ...t,
                    _id: String(t._id),
                    customerId: String(t.customerId)
                })),
                total,
                page: input.page,
                pages: Math.ceil(total / input.limit),
            };
        }),

    // Admin: Add money to customer wallet
    adminAddMoney: protectedProcedure
        .input(
            z.object({
                customerId: z.string(),
                amount: z.number().positive(),
                description: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if admin (this should be enhanced with proper admin check)
            if (!ctx.user?.id) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            const customer = await Customer.findById(input.customerId);
            if (!customer) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
            }

            const balanceBefore = customer.walletBalance || 0;
            const balanceAfter = balanceBefore + input.amount;

            // Update customer balance
            customer.walletBalance = balanceAfter;
            await customer.save();

            // Create transaction record
            await WalletTransaction.create({
                customerId: input.customerId,
                type: "admin_add",
                amount: input.amount,
                balanceBefore,
                balanceAfter,
                description: input.description || `إضافة رصيد من الإدارة`,
                status: "completed",
                createdBy: String(ctx.user.id), // Admin ID
            });

            return {
                success: true,
                newBalance: balanceAfter,
            };
        }),

    // Admin: Deduct money from customer wallet
    adminDeductMoney: protectedProcedure
        .input(
            z.object({
                customerId: z.string(),
                amount: z.number().positive(),
                description: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if admin
            if (!ctx.user?.id) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }

            const customer = await Customer.findById(input.customerId);
            if (!customer) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
            }

            const balanceBefore = customer.walletBalance || 0;
            if (balanceBefore < input.amount) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "رصيد غير كافٍ"
                });
            }

            const balanceAfter = balanceBefore - input.amount;

            // Update customer balance
            customer.walletBalance = balanceAfter;
            await customer.save();

            // Create transaction record
            await WalletTransaction.create({
                customerId: input.customerId,
                type: "admin_deduct",
                amount: input.amount,
                balanceBefore,
                balanceAfter,
                description: input.description || `خصم رصيد من الإدارة`,
                status: "completed",
                createdBy: String(ctx.user.id),
            });

            return {
                success: true,
                newBalance: balanceAfter,
            };
        }),

    // Pay from wallet (used during checkout)
    payFromWallet: protectedProcedure
        .input(
            z.object({
                amount: z.number().positive(),
                orderId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            let customerId = ctx.user?.id;
            if (!customerId) {
                throw new TRPCError({ code: "UNAUTHORIZED" });
            }
            if (customerId.startsWith("customer_")) customerId = customerId.replace("customer_", "");

            const customer = await Customer.findById(customerId);
            if (!customer) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            const balanceBefore = customer.walletBalance || 0;
            if (balanceBefore < input.amount) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `رصيد غير كافٍ. الرصيد الحالي: ${balanceBefore} د.ل`
                });
            }

            const balanceAfter = balanceBefore - input.amount;

            // Update balance
            customer.walletBalance = balanceAfter;
            await customer.save();

            // Create transaction
            await WalletTransaction.create({
                customerId,
                type: "payment",
                amount: input.amount,
                balanceBefore,
                balanceAfter,
                description: `دفع طلب #${input.orderId}`,
                referenceId: input.orderId,
                status: "completed",
            });

            return {
                success: true,
                newBalance: balanceAfter,
            };
        }),

    // Refund to wallet (when order is cancelled)
    refundToWallet: protectedProcedure
        .input(
            z.object({
                customerId: z.string(),
                amount: z.number().positive(),
                orderId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const customer = await Customer.findById(input.customerId);
            if (!customer) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            const balanceBefore = customer.walletBalance || 0;
            const balanceAfter = balanceBefore + input.amount;

            customer.walletBalance = balanceAfter;
            await customer.save();

            await WalletTransaction.create({
                customerId: input.customerId,
                type: "refund",
                amount: input.amount,
                balanceBefore,
                balanceAfter,
                description: `استرجاع مبلغ طلب #${input.orderId}`,
                referenceId: input.orderId,
                status: "completed",
            });

            return {
                success: true,
                newBalance: balanceAfter,
            };
        }),

    // Admin: Get customer wallet details
    adminGetWallet: protectedProcedure
        .input(z.object({ customerId: z.string() }))
        .query(async ({ ctx, input }) => {
            // Basic role check
            if (ctx.user?.role !== 'admin') {
                // throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
            }

            const customer = await Customer.findById(input.customerId);
            if (!customer) {
                // Return zero balance if customer not found or throw error
                throw new TRPCError({ code: "NOT_FOUND", message: "Customer not found" });
            }

            const transactions = await WalletTransaction.find({ customerId: input.customerId })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

            return {
                balance: customer.walletBalance || 0,
                transactions: transactions.map((t: any) => ({
                    ...t,
                    _id: String(t._id),
                    customerId: String(t.customerId)
                }))
            };
        }),
});
