import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { AdminUser } from "../server/schemas";

async function setupAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/online_store";

    console.log("[Setup] جاري الاتصال بـ MongoDB:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("[Setup] ✅ تم الاتصال بـ MongoDB بنجاح");

    // التحقق من وجود مستخدم admin
    const existingAdmin = await AdminUser.findOne({ username: "admin" });

    if (existingAdmin) {
      console.log("[Setup] ✅ مستخدم admin موجود بالفعل");
      console.log("[Setup] بيانات المستخدم:", {
        id: existingAdmin._id,
        username: existingAdmin.username,
        email: existingAdmin.email,
        isActive: existingAdmin.isActive,
      });
      await mongoose.disconnect();
      return;
    }

    // إنشاء كلمة مرور مشفرة
    const passwordHash = await bcrypt.hash("admin123", 10);

    // إنشاء مستخدم admin جديد
    const admin = new AdminUser({
      username: "admin",
      passwordHash: passwordHash,
      email: "admin@sabostore.com",
      name: "Admin User",
      isActive: true,
    });

    await admin.save();

    console.log("[Setup] ✅ تم إنشاء مستخدم admin بنجاح");
    console.log("[Setup] بيانات الدخول:");
    console.log("[Setup]   اسم المستخدم: admin");
    console.log("[Setup]   كلمة المرور: admin123");
    console.log("[Setup]   البريد الإلكتروني: admin@sabostore.com");

    await mongoose.disconnect();
    console.log("[Setup] ✅ تم قطع الاتصال بـ MongoDB");
  } catch (error) {
    console.error("[Setup] ❌ خطأ:", error);
    process.exit(1);
  }
}

setupAdmin();
