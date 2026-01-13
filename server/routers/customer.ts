import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { Customer } from "../schemas";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

export const customerRouter = router({
    // Register new customer
    register: publicProcedure
        .input(
            z.object({
                phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"),
                email: z.string({ required_error: "البريد الإلكتروني مطلوب" }).email("البريد الإلكتروني غير صحيح"),
                password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
                name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
                cityId: z.string({ message: "يرجى اختيار المدينة" }),
                area: z.string().optional(),
                address: z.string().optional(),
                alternativePhone: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            // Check if customer already exists by phone
            const existingCustomer = await Customer.findOne({ phone: input.phone });

            if (existingCustomer) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "رقم الهاتف مسجل مسبقاً",
                });
            }

            // Check email if provided
            if (input.email) {
                const existingEmail = await Customer.findOne({ email: input.email });
                if (existingEmail) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "البريد الإلكتروني مسجل مسبقاً",
                    });
                }
            }

            // Hash password
            const passwordHash = await bcrypt.hash(input.password, 10);

            // Generate Wallet Number
            // Generate Wallet Number: Wal-SB_ + 7 random digits
            let walletNumber = `Wal-SB_${Math.floor(1000000 + Math.random() * 9000000)}`;
            let walletExists = await Customer.findOne({ walletNumber });
            while (walletExists) {
                walletNumber = `Wal-SB_${Math.floor(1000000 + Math.random() * 9000000)}`;
                walletExists = await Customer.findOne({ walletNumber });
            }

            // Create customer
            const customer = await Customer.create({
                phone: input.phone,
                email: input.email || undefined, // Force undefined if null/empty
                passwordHash,
                name: input.name,
                cityId: input.cityId,
                area: input.area,
                address: input.address,
                alternativePhone: input.alternativePhone,
                walletNumber: walletNumber,
                isActive: true,
            });

            return {
                success: true,
                customerId: customer._id.toString(),
                message: "تم التسجيل بنجاح",
            };
        }),

    // Login customer
    login: publicProcedure
        .input(
            z.object({
                identifier: z.string(), // Can be phone or email
                password: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const identifier = input.identifier.trim();
            console.log(`[Login Attempt] Identifier: "${identifier}"`);

            // Find customer by phone or email (case-insensitive for email)
            const customer = await Customer.findOne({
                $or: [
                    { phone: identifier },
                    { email: { $regex: new RegExp(`^${identifier}$`, 'i') } } // Case insensitive email match
                ],
            }).select('+passwordHash');

            if (!customer) {
                console.warn(`[Login Failed] No customer found for identifier: "${identifier}"`);
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "بيانات الدخول غير صحيحة (المستخدم غير موجود)",
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(
                input.password,
                customer.passwordHash
            );

            if (!isValidPassword) {
                console.warn(`[Login Failed] Invalid password for user: ${customer.email || customer.phone}`);
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "بيانات الدخول غير صحيحة (كلمة المرور خطأ)",
                });
            }

            // Update last login
            customer.lastLogin = new Date();
            await customer.save();

            // Create session token using SDK (same as auth.login)
            const { sdk } = await import("../_core/sdk");
            const { COOKIE_NAME } = await import("@shared/const");
            const { getSessionCookieOptions } = await import("../_core/cookies");

            const sessionToken = await sdk.createSessionToken(
                `customer_${customer._id.toString()}`,
                {
                    role: "customer", // CRITICAL: Needed for sdk.authenticateRequest to recognize customer sessions
                    name: customer.name || customer.phone,
                }
            );

            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

            return {
                success: true,
                sessionToken, // Return token for client-side storage
                customer: {
                    id: customer._id.toString(),
                    phone: customer.phone,
                    email: customer.email,
                    name: customer.name,
                },
            };
        }),

    // Get current customer
    me: publicProcedure.query(async ({ ctx }) => {
        // Check if user is logged in and is a customer
        if (!ctx.user?.id) {
            return null;
        }

        const userId = String(ctx.user.id);
        if (!userId.startsWith("customer_")) {
            return null;
        }

        const customerId = userId.replace("customer_", "");
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return null;
        }

        return {
            id: customer._id.toString(),
            phone: customer.phone,
            email: customer.email,
            name: customer.name,
            cityId: customer.cityId,
            area: customer.area,
            address: customer.address,
            alternativePhone: customer.alternativePhone,
            walletNumber: customer.walletNumber,
        };
    }),

    // Update customer profile
    updateProfile: publicProcedure
        .input(
            z.object({
                name: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").optional(),
                email: z.string().email("البريد الإلكتروني غير صحيح").optional(),
                cityId: z.union([z.string(), z.number()]).optional(),
                area: z.string().optional(),
                address: z.string().optional(),
                alternativePhone: z.string().optional(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            // Check if user is logged in and is a customer
            if (!ctx.user?.id) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "يجب تسجيل الدخول أولاً",
                });
            }

            const userId = String(ctx.user.id);
            if (!userId.startsWith("customer_")) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "غير مصرح",
                });
            }

            const customerId = userId.replace("customer_", "");

            // Check if email is being updated and already exists
            if (input.email) {
                const existingEmail = await Customer.findOne({
                    email: input.email,
                    _id: { $ne: customerId },
                });
                if (existingEmail) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: "البريد الإلكتروني مسجل لعميل آخر",
                    });
                }
            }

            // Update customer
            const customer = await Customer.findByIdAndUpdate(
                customerId,
                { $set: input },
                { new: true }
            );

            if (!customer) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "العميل غير موجود",
                });
            }

            return {
                success: true,
                message: "تم تحديث البيانات بنجاح",
                customer: {
                    id: customer._id.toString(),
                    phone: customer.phone,
                    email: customer.email,
                    name: customer.name,
                    cityId: customer.cityId,
                    area: customer.area,
                    address: customer.address,
                    alternativePhone: customer.alternativePhone,
                },
            };
        }),

    // Logout
    logout: publicProcedure.mutation(async ({ ctx }) => {
        const { COOKIE_NAME } = await import("@shared/const");
        const { getSessionCookieOptions } = await import("../_core/cookies");

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

        return { success: true };
    }),

    // Admin: Get all customers
    getAll: protectedProcedure
        .input(z.object({ limit: z.number().optional(), offset: z.number().optional(), search: z.string().optional() }).optional())
        .query(async ({ ctx, input }) => {
            if (ctx.user.role !== 'admin') {
                throw new TRPCError({ code: "FORBIDDEN", message: "تتطلب صلاحيات الأدمن" });
            }

            const limit = input?.limit || 50;
            const skip = input?.offset || 0;
            const searchQuery: any = input?.search ? {
                $or: [
                    { name: { $regex: input.search, $options: "i" } },
                    { phone: { $regex: input.search, $options: "i" } },
                    { email: { $regex: input.search, $options: "i" } },
                    { walletNumber: { $regex: input.search, $options: "i" } }
                ]
            } : {};

            const [customers, total] = await Promise.all([
                Customer.find(searchQuery).sort({ createdAt: -1 }).skip(skip).limit(limit),
                Customer.countDocuments(searchQuery)
            ]);

            return {
                customers: customers.map((c: any) => {
                    const obj = c.toObject();
                    delete obj.passwordHash; // Critical: Remove password hash
                    return {
                        ...obj,
                        _id: String(c._id)
                    };
                }),
                total
            };
        }),

    // Delete customer (Admin only)
    delete: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
            // Check if user is admin
            if (ctx.user.role !== 'admin') {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
            }

            const customer = await Customer.findByIdAndDelete(input.id);
            if (!customer) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Customer not found' });
            }

            return { success: true };
        }),

    // Delete multiple customers (Admin only)
    deleteMany: protectedProcedure
        .input(z.object({ ids: z.array(z.string()) }))
        .mutation(async ({ input, ctx }) => {
            // Check if user is admin
            if (ctx.user.role !== 'admin') {
                throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
            }

            const result = await Customer.deleteMany({ _id: { $in: input.ids } });
            return { success: true, deletedCount: result.deletedCount };
        }),

    // --- Password Reset Flow ---

    // 1. Request OTP (Email)
    requestPasswordReset: publicProcedure
        .input(z.object({ email: z.string().email("البريد الإلكتروني غير صحيح") }))
        .mutation(async ({ input }) => {
            const customer = await Customer.findOne({ email: input.email });

            if (!customer) {
                // Determine error message based on security standard
                // Often we don't want to reveal if a user exists, but for UX on this store, we might.
                // Let's reveal for better UX in this context.
                throw new TRPCError({ code: "NOT_FOUND", message: "البريد الإلكتروني غير مسجل" });
            }

            // Generate 6 digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // Hash OTP before storing
            const otpHash = await bcrypt.hash(otp, 10);

            // Set expiry (15 minutes)
            const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

            // Update customer
            customer.otpCode = otpHash;
            customer.otpExpires = otpExpires;
            await customer.save();

            // Send OTP via Email
            try {
                const { sendEmail, generateVerificationEmail } = await import("../services/email");
                const html = generateVerificationEmail(otp, customer.name);

                const sent = await sendEmail({
                    to: input.email,
                    subject: "رمز التحقق - استعادة كلمة المرور",
                    html
                });

                if (sent) {
                    console.log(`[Email] OTP sent successfully to ${input.email}`);
                } else {
                    console.error(`[Email] Failed to send OTP to ${input.email}`);
                    throw new Error("فشل إرسال البريد الإلكتروني");
                }

            } catch (error) {
                console.error('[Email] Failed to send OTP:', error);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل إرسال رمز التحقق" });
            }

            return { success: true, message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" };

        }),

    // 2. Verify OTP (Optional step for UI feedback before password change)
    verifyOtp: publicProcedure
        .input(z.object({ email: z.string().email(), otp: z.string() }))
        .mutation(async ({ input }) => {
            const customer = await Customer.findOne({ email: input.email }).select('+otpCode +otpExpires');

            if (!customer || !customer.otpCode || !customer.otpExpires) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "طلب غير صالح" });
            }

            if (customer.otpExpires < new Date()) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "انتهت صلاحية الرمز، حاول مرة أخرى" });
            }

            const isValid = await bcrypt.compare(input.otp, customer.otpCode);
            if (!isValid) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "الرمز غير صحيح" });
            }

            return { success: true, message: "الرمز صحيح" };
        }),

    // 3. Reset Password with OTP
    resetPasswordWithOtp: publicProcedure
        .input(z.object({
            email: z.string().email(),
            otp: z.string(),
            newPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
        }))
        .mutation(async ({ input }) => {
            const customer = await Customer.findOne({ email: input.email }).select('+otpCode +otpExpires');

            if (!customer || !customer.otpCode || !customer.otpExpires) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "طلب غير صالح" });
            }

            if (customer.otpExpires < new Date()) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "انتهت صلاحية الرمز، حاول مرة أخرى" });
            }

            const isValid = await bcrypt.compare(input.otp, customer.otpCode);
            if (!isValid) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "الرمز غير صحيح" });
            }

            // Hash new password
            const passwordHash = await bcrypt.hash(input.newPassword, 10);

            // Update customer
            customer.passwordHash = passwordHash;
            customer.otpCode = undefined; // Clear OTP
            customer.otpExpires = undefined;
            await customer.save();

            return { success: true, message: "تم تغيير كلمة المرور بنجاح" };
        }),

});
