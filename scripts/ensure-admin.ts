import "dotenv/config";
import { getDb } from "../server/db";
import { adminUsers } from "../drizzle/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function ensureAdmin() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ لا يمكن الاتصال بقاعدة البيانات");
      console.log("تأكد من أن قاعدة البيانات تعمل وأن متغيرات البيئة صحيحة");
      return;
    }

    // البحث عن مستخدم admin
    const admin = await db
      .select()
      .from(adminUsers)
      .where((t) => t.username === "admin")
      .limit(1);

    if (admin.length > 0) {
      console.log("✅ مستخدم admin موجود");
      console.log("بيانات المستخدم:", {
        id: admin[0].id,
        username: admin[0].username,
        email: admin[0].email,
        isActive: admin[0].isActive,
      });
      
      // تحديث كلمة المرور للتأكد
      const passwordHash = await bcrypt.hash("admin123", 10);
      await db
        .update(adminUsers)
        .set({ passwordHash })
        .where(eq(adminUsers.id, admin[0].id));
      
      console.log("✅ تم تحديث كلمة المرور إلى: admin123");
      return;
    }

    // إنشاء مستخدم admin جديد
    console.log("❌ مستخدم admin غير موجود، جاري الإنشاء...");
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    await db.insert(adminUsers).values({
      username: "admin",
      passwordHash: passwordHash,
      email: "admin@sabostore.com",
      name: "Admin User",
      isActive: true,
    });

    console.log("✅ تم إنشاء مستخدم admin بنجاح");
    console.log("بيانات الدخول:");
    console.log("  اسم المستخدم: admin");
    console.log("  كلمة المرور: admin123");
  } catch (error) {
    console.error("❌ خطأ:", error);
    process.exit(1);
  }
}

ensureAdmin();



