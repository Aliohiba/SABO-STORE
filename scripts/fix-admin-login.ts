import "dotenv/config";
import { getDb } from "../server/db";
import { adminUsers } from "../drizzle/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function fixAdminLogin() {
  try {
    console.log("جاري الاتصال بقاعدة البيانات...");
    const db = await getDb();
    
    if (!db) {
      console.error("❌ لا يمكن الاتصال بقاعدة البيانات");
      console.log("\nتأكد من:");
      console.log("1. أن قاعدة البيانات MySQL تعمل");
      console.log("2. أن متغير DATABASE_URL موجود في ملف .env");
      console.log("3. أن بيانات الاتصال صحيحة");
      console.log("\nمثال على DATABASE_URL:");
      console.log("DATABASE_URL=mysql://root:password@localhost:3306/online_store");
      return;
    }

    console.log("✅ تم الاتصال بقاعدة البيانات بنجاح");

    // البحث عن مستخدم admin
    const admin = await db
      .select()
      .from(adminUsers)
      .where((t) => t.username === "admin")
      .limit(1);

    if (admin.length > 0) {
      console.log("\n✅ مستخدم admin موجود");
      console.log("بيانات المستخدم:", {
        id: admin[0].id,
        username: admin[0].username,
        email: admin[0].email,
        isActive: admin[0].isActive,
      });
      
      // تحديث كلمة المرور
      console.log("\nجاري تحديث كلمة المرور...");
      const passwordHash = await bcrypt.hash("admin123", 10);
      await db
        .update(adminUsers)
        .set({ passwordHash })
        .where(eq(adminUsers.id, admin[0].id));
      
      console.log("✅ تم تحديث كلمة المرور بنجاح");
      console.log("\nبيانات الدخول:");
      console.log("  اسم المستخدم: admin");
      console.log("  كلمة المرور: admin123");
      return;
    }

    // إنشاء مستخدم admin جديد
    console.log("\n❌ مستخدم admin غير موجود، جاري الإنشاء...");
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    await db.insert(adminUsers).values({
      username: "admin",
      passwordHash: passwordHash,
      email: "admin@sabostore.com",
      name: "Admin User",
      isActive: true,
    });

    console.log("✅ تم إنشاء مستخدم admin بنجاح");
    console.log("\nبيانات الدخول:");
    console.log("  اسم المستخدم: admin");
    console.log("  كلمة المرور: admin123");
  } catch (error) {
    console.error("\n❌ خطأ:", error);
    if (error instanceof Error) {
      console.error("تفاصيل الخطأ:", error.message);
    }
  }
}

fixAdminLogin();

