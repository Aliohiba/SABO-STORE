import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import { adminUsers } from "../drizzle/schema";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

async function setupAdmin() {
  try {
    // إنشاء اتصال مؤقت للتحقق من وجود قاعدة البيانات
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "password",
    });

    // إنشاء قاعدة البيانات إذا لم تكن موجودة
    await connection.execute(
      "CREATE DATABASE IF NOT EXISTS online_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );
    console.log("✅ تم التحقق من قاعدة البيانات");

    await connection.end();

    // الاتصال بقاعدة البيانات
    const db = drizzle(process.env.DATABASE_URL!);

    // التحقق من وجود مستخدم admin
    const existingAdmin = await db
      .select()
      .from(adminUsers)
      .where((t) => t.username === "admin")
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("✅ مستخدم admin موجود بالفعل");
      console.log("بيانات المستخدم:", {
        id: existingAdmin[0].id,
        username: existingAdmin[0].username,
        email: existingAdmin[0].email,
        isActive: existingAdmin[0].isActive,
      });
      return;
    }

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
  } catch (error) {
    console.error("❌ خطأ في إعداد المستخدم:", error);
    process.exit(1);
  }
}

setupAdmin();
