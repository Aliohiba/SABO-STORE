import "dotenv/config";
import mongoose from "mongoose";
import { Category, Product } from "../server/schemas";
import { City, DeliveryCompany, ProductOption } from "../server/schemas-extended";

async function seedData() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/online_store";
    console.log("[Seed] جاري الاتصال بـ MongoDB:", mongoUri);
    await mongoose.connect(mongoUri);
    console.log("[Seed] ✅ تم الاتصال بـ MongoDB بنجاح");

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await City.deleteMany({});
    await DeliveryCompany.deleteMany({});
    await ProductOption.deleteMany({});
    console.log("[Seed] تم حذف البيانات القديمة");

    // Create Categories
    const categories = await Category.insertMany([
      {
        name: "الملابس",
        description: "ملابس رجالية ونسائية وأطفال",
      },
      {
        name: "الأحذية",
        description: "أحذية رياضية وكاجوال وفورمال",
      },
      {
        name: "الإكسسوارات",
        description: "حقائب وأحزمة وإكسسوارات",
      },
      {
        name: "الإلكترونيات",
        description: "أجهزة إلكترونية وملحقاتها",
      },
    ]);
    console.log("[Seed] ✅ تم إنشاء", categories.length, "فئات");

    // Create Products
    const products = await Product.insertMany([
      {
        name: "قميص رجالي أزرق",
        description: "قميص رجالي مريح من القطن الخالص",
        productCode: "SHIRT-001",
        categoryId: categories[0]._id,
        stock: 50,
        minQuantity: 10,
        costPrice: 15,
        price: 29.99,
        salePrice: 29.99,
        discount: 5,
        profitPercentage: 99.93,
        active: true,
      },
      {
        name: "حذاء رياضي أسود",
        description: "حذاء رياضي مريح وخفيف الوزن",
        productCode: "SHOE-001",
        categoryId: categories[1]._id,
        stock: 30,
        minQuantity: 5,
        costPrice: 25,
        price: 59.99,
        salePrice: 59.99,
        discount: 10,
        profitPercentage: 139.96,
        active: true,
      },
      {
        name: "حقيبة يد جلدية",
        description: "حقيبة يد جلدية أصلية فاخرة",
        productCode: "BAG-001",
        categoryId: categories[2]._id,
        stock: 20,
        minQuantity: 3,
        costPrice: 40,
        price: 99.99,
        salePrice: 99.99,
        discount: 0,
        profitPercentage: 149.975,
        active: true,
      },
      {
        name: "سماعات بلوتوث",
        description: "سماعات بلوتوث لاسلكية عالية الجودة",
        productCode: "AUDIO-001",
        categoryId: categories[3]._id,
        stock: 15,
        minQuantity: 2,
        costPrice: 30,
        price: 79.99,
        salePrice: 79.99,
        discount: 15,
        profitPercentage: 166.633,
        active: true,
      },
      {
        name: "بنطال جينز أزرق",
        description: "بنطال جينز مريح وعصري",
        productCode: "JEANS-001",
        categoryId: categories[0]._id,
        stock: 40,
        minQuantity: 8,
        costPrice: 20,
        price: 49.99,
        salePrice: 49.99,
        discount: 0,
        profitPercentage: 149.95,
        active: true,
      },
    ]);
    console.log("[Seed] ✅ تم إنشاء", products.length, "منتج");

    // Create Cities
    const cities = await City.insertMany([
      {
        name: "عمّان",
        deliveryPrice: 5,
        active: true,
      },
      {
        name: "الزرقاء",
        deliveryPrice: 7,
        active: true,
      },
      {
        name: "إربد",
        deliveryPrice: 10,
        active: true,
      },
      {
        name: "عجلون",
        deliveryPrice: 8,
        active: true,
      },
      {
        name: "الكرك",
        deliveryPrice: 12,
        active: true,
      },
    ]);
    console.log("[Seed] ✅ تم إنشاء", cities.length, "مدينة");

    // Create Delivery Companies
    const deliveryCompanies = await DeliveryCompany.insertMany([
      {
        name: "أرامكس",
        phone: "+962791234567",
        apiUrl: "https://api.aramex.com",
        apiKey: "sample-key",
        active: true,
      },
      {
        name: "الخطوط الجوية الملكية",
        phone: "+962791234568",
        apiUrl: "https://api.rja.jo",
        apiKey: "sample-key",
        active: true,
      },
      {
        name: "شركة التوصيل السريع",
        phone: "+962791234569",
        apiUrl: "https://api.fastdelivery.jo",
        apiKey: "sample-key",
        active: true,
      },
    ]);
    console.log("[Seed] ✅ تم إنشاء", deliveryCompanies.length, "شركة توصيل");

    // Create Product Options
    const productOptions = await ProductOption.insertMany([
      {
        type: "COLOR",
        value: "أحمر",
      },
      {
        type: "COLOR",
        value: "أزرق",
      },
      {
        type: "COLOR",
        value: "أسود",
      },
      {
        type: "COLOR",
        value: "أبيض",
      },
      {
        type: "SIZE",
        value: "XS",
      },
      {
        type: "SIZE",
        value: "S",
      },
      {
        type: "SIZE",
        value: "M",
      },
      {
        type: "SIZE",
        value: "L",
      },
      {
        type: "SIZE",
        value: "XL",
      },
      {
        type: "SIZE",
        value: "XXL",
      },
    ]);
    console.log("[Seed] ✅ تم إنشاء", productOptions.length, "خيار منتج");

    console.log("[Seed] ✅ تم إضافة جميع البيانات الأولية بنجاح!");

    await mongoose.disconnect();
    console.log("[Seed] ✅ تم قطع الاتصال بـ MongoDB");
  } catch (error) {
    console.error("[Seed] ❌ خطأ:", error);
    process.exit(1);
  }
}

seedData();
