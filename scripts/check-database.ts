import { connectMongoDB, getMongoConnection } from "../server/mongodb";
import mongoose from "mongoose";

async function checkDatabase() {
  try {
    console.log("🔌 جاري الاتصال بقاعدة البيانات MongoDB...\n");

    // الاتصال بقاعدة البيانات
    await connectMongoDB();

    const connection = getMongoConnection();
    const db = connection.db;

    console.log("✅ تم الاتصال بنجاح!\n");
    console.log("📊 معلومات الاتصال:");
    console.log(`   - الحالة: ${connection.readyState === 1 ? "متصل" : "غير متصل"}`);
    console.log(`   - اسم قاعدة البيانات: ${db?.databaseName || "غير محدد"}`);
    console.log(`   - العنوان: ${connection.host || "غير محدد"}`);
    console.log(`   - المنفذ: ${connection.port || "غير محدد"}\n`);

    // عرض المجموعات (Collections) الموجودة
    console.log("📁 المجموعات (Collections) الموجودة:");
    const collections = await db?.listCollections().toArray();
    if (collections && collections.length > 0) {
      for (const collection of collections) {
        const count = await db?.collection(collection.name).countDocuments();
        console.log(`   - ${collection.name}: ${count} وثيقة`);
      }
    } else {
      console.log("   ⚠️ لا توجد مجموعات في قاعدة البيانات");
    }

    console.log("\n📋 المجموعات الرئيسية:");
    const mainCollections = [
      "adminusers",
      "users",
      "categories",
      "products",
      "cartitems",
      "orders",
      "orderitems",
    ];

    for (const collectionName of mainCollections) {
      try {
        const collection = db?.collection(collectionName);
        if (collection) {
          const count = await collection.countDocuments();
          console.log(`   - ${collectionName}: ${count} وثيقة`);
          
          // عرض عينة من البيانات (أول 3 وثائق)
          if (count > 0) {
            const sample = await collection.find({}).limit(3).toArray();
            console.log(`     عينة: ${JSON.stringify(sample.map(d => ({ id: d._id, name: d.name || d.username || d.orderNumber || "N/A" })), null, 2)}`);
          }
        }
      } catch (error) {
        console.log(`   - ${collectionName}: غير موجود`);
      }
    }

    console.log("\n✅ اكتمل التحقق من قاعدة البيانات");

  } catch (error) {
    console.error("❌ خطأ في الاتصال بقاعدة البيانات:", error);
    process.exit(1);
  } finally {
    // إغلاق الاتصال
    await mongoose.disconnect();
    console.log("\n🔌 تم إغلاق الاتصال بقاعدة البيانات");
  }
}

// تشغيل السكريبت
checkDatabase();

