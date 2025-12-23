import "dotenv/config";
import mongoose from "mongoose";
import { AdminUser } from "../server/schemas";
import { connectMongoDB } from "../server/mongodb";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import bcrypt from "bcryptjs";

const csvFilePath = path.join(
  "/home/ubuntu/upload/adminUsers_20251223_085111.csv"
);

interface CsvAdminUser {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  name: string;
  isActive: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

async function importAdminUsers() {
  await connectMongoDB();

  try {
    const results: CsvAdminUser[] = [];
    const stream = fs.createReadStream(csvFilePath).pipe(csv());

    for await (const data of stream) {
      results.push(data as CsvAdminUser);
    }

    if (results.length === 0) {
      console.log("❌ لا توجد بيانات لاستيرادها.");
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ تم قراءة ${results.length} سجل من ملف CSV.`);

    // 1. حذف جميع مستخدمي الإدارة الحاليين
    await AdminUser.deleteMany({});
    console.log("✅ تم حذف جميع مستخدمي الإدارة الحاليين.");

    // 2. إدراج البيانات الجديدة
    const importedUsers = results.map((user) => {
      // إذا كان الحقل passwordHash لا يبدأ بـ $2b$ أو $2a$ (أي أنه كلمة مرور نصية عادية)، نقوم بتشفيره
      let finalPasswordHash = user.passwordHash;
      if (!finalPasswordHash.startsWith("$2b$") && !finalPasswordHash.startsWith("$2a$")) {
        console.log(`⚠️ تشفير كلمة مرور المستخدم: ${user.username}`);
        finalPasswordHash = bcrypt.hashSync(finalPasswordHash, 10);
      }

      return {
        username: user.username,
        passwordHash: finalPasswordHash,
        email: user.email,
        name: user.name,
        isActive: user.isActive === "1" || user.isActive.toLowerCase() === "true",
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      };
    });

    await AdminUser.insertMany(importedUsers);
    console.log(`✅ تم استيراد ${importedUsers.length} مستخدم إدارة بنجاح.`);

    // 3. عرض المستخدمين الجدد
    const newAdmins = await AdminUser.find({});
    console.log("\n📋 مستخدمو الإدارة الجدد:");
    newAdmins.forEach((admin) => {
      console.log(`- ${admin.username} (${admin.email}) - نشط: ${admin.isActive}`);
    });
  } catch (error) {
    console.error("❌ خطأ في عملية الاستيراد:", error);
  } finally {
    await mongoose.disconnect();
  }
}

importAdminUsers();
