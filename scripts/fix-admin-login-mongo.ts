import "dotenv/config";
import { connectMongoDB } from "../server/mongodb";
import { AdminUser } from "../server/schemas";
import bcrypt from "bcryptjs";

async function fixAdminLoginMongo() {
  try {
    console.log("جاري الاتصال بقاعدة البيانات MongoDB...");
    
    // الاتصال بـ MongoDB
    await connectMongoDB();
    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");

    // البحث عن مستخدم admin
    const admin = await AdminUser.findOne({ username: "admin" });

    if (admin) {
      console.log("\n✅ مستخدم admin موجود");
      console.log("بيانات المستخدم:", {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        isActive: admin.isActive,
      });
      
      // تحديث كلمة المرور
      console.log("\nجاري تحديث كلمة المرور...");
      const passwordHash = await bcrypt.hash("admin123", 10);
      admin.passwordHash = passwordHash;
      await admin.save();
      
      console.log("✅ تم تحديث كلمة المرور بنجاح");
      console.log("\nبيانات الدخول:");
      console.log("  اسم المستخدم: admin");
      console.log("  كلمة المرور: admin123");
      return;
    }

    // إنشاء مستخدم admin جديد
    console.log("\n❌ مستخدم admin غير موجود، جاري الإنشاء...");
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    const newAdmin = new AdminUser({
      username: "admin",
      passwordHash: passwordHash,
      email: "admin@sabostore.com",
      name: "Admin User",
      isActive: true,
    });

    await newAdmin.save();

    console.log("✅ تم إنشاء مستخدم admin بنجاح");
    console.log("\nبيانات الدخول:");
    console.log("  اسم المستخدم: admin");
    console.log("  كلمة المرور: admin123");
  } catch (error) {
    console.error("\n❌ خطأ:", error);
    if (error instanceof Error) {
      console.error("تفاصيل الخطأ:", error.message);
    }
    process.exit(1);
  } finally {
    // إغلاق الاتصال
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
  }
}

fixAdminLoginMongo();



