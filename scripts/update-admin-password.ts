import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { adminUsers } from "../drizzle/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import mysql from "mysql2/promise";

async function updateAdminPassword() {
  try {
    // إنشاء اتصال MySQL مباشر
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const db = drizzle(connection);

    // البحث عن مستخدم admin
    const admin = await db
      .select()
      .from(adminUsers)
      .where((t) => t.username === "admin")
      .limit(1);

    if (admin.length === 0) {
      console.log("❌ لم يتم العثور على مستخدم admin");
      console.log("جاري إنشاء مستخدم admin جديد...");
      
      // إنشاء كلمة مرور مشفرة
      const passwordHash = await bcrypt.hash("admin123", 10);

      // إدراج مستخدم admin جديد
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
      await connection.end();
      return;
    }

    // تحديث كلمة المرور
    const passwordHash = await bcrypt.hash("admin123", 10);
    await db
      .update(adminUsers)
      .set({ passwordHash })
      .where(eq(adminUsers.id, admin[0].id));

    console.log("✅ تم تحديث كلمة مرور المسؤول بنجاح");
    console.log("بيانات الدخول:");
    console.log("  اسم المستخدم: admin");
    console.log("  كلمة المرور: admin123");
    
    await connection.end();
  } catch (error) {
    console.error("❌ خطأ في تحديث كلمة المرور:", error);
    process.exit(1);
  }
}

updateAdminPassword();
