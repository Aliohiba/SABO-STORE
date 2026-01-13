
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { AdminUser } from "../schemas";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { sdk } from "../_core/sdk";
import { getSessionCookieOptions } from "../_core/cookies";
import { COOKIE_NAME } from "@shared/const";

export const adminRouter = router({
    login: publicProcedure
        .input(
            z.object({
                username: z.string(),
                password: z.string(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            // Find admin by username
            const admin = await AdminUser.findOne({
                username: input.username,
            });

            if (!admin) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "اسم المستخدم أو كلمة المرور غير صحيحة",
                });
            }

            // Verify password
            const isValid = await bcrypt.compare(input.password, admin.passwordHash);

            if (!isValid) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "اسم المستخدم أو كلمة المرور غير صحيحة",
                });
            }

            // Create session
            // Note: We use a prefix or role field in the session to distinguish admin
            const sessionToken = await sdk.createSessionToken(admin._id.toString(), {
                name: admin.username,
                role: "admin",
                permissions: admin.permissions
            });

            const cookieOptions = getSessionCookieOptions(ctx.req);
            ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

            return {
                success: true,
                user: {
                    id: admin._id,
                    username: admin.username,
                    role: "admin",
                },
            };
        }),

    logout: protectedProcedure.mutation(({ ctx }) => {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
        return { success: true };
    }),

    me: publicProcedure.query(({ ctx }) => {
        if (ctx.user?.role === "admin") {
            return {
                id: ctx.user.id,
                username: ctx.user.name,
                role: "admin",
            };
        }
        return null;
    }),
});
