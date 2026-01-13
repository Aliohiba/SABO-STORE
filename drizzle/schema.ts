import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Categories table
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// Products table
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  categoryId: integer("categoryId").notNull(),
  price: real("price").notNull(),
  originalPrice: real("originalPrice"),
  image: text("image"),
  images: text("images", { mode: "json" }).$type<string[]>(),
  stock: integer("stock").notNull().default(0),
  status: text("status", { enum: ["available", "unavailable", "coming_soon"] }).default("available").notNull(),
  tags: text("tags", { mode: "json" }).$type<string[]>(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Cart items table
export const cartItems = sqliteTable("cartItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

// Orders table
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId"),
  orderNumber: text("orderNumber").notNull().unique(),
  customerName: text("customerName").notNull(),
  customerEmail: text("customerEmail").notNull(),
  customerPhone: text("customerPhone").notNull(),
  customerAddress: text("customerAddress").notNull(),
  totalAmount: real("totalAmount").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"] }).default("pending").notNull(),
  paymentMethod: text("paymentMethod").default("cash_on_delivery").notNull(),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order items table
export const orderItems = sqliteTable("orderItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  productName: text("productName").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Admin users table for admin authentication
export const adminUsers = sqliteTable("adminUsers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  email: text("email"),
  name: text("name"),
  isActive: integer("isActive", { mode: "boolean" }).default(true).notNull(),
  lastLogin: integer("lastLogin", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).$defaultFn(() => new Date()).notNull(),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;