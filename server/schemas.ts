import mongoose, { Schema, Document } from "mongoose";

// Admin User Schema
export interface IAdminUser extends Document {
  username: string;
  passwordHash: string;
  email?: string;
  name?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    email: { type: String, sparse: true },
    name: String,
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

export const AdminUser = mongoose.model<IAdminUser>("AdminUser", adminUserSchema);

// User Schema
export interface IUser extends Document {
  openId: string;
  name?: string;
  email?: string;
  loginMethod?: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

const userSchema = new Schema<IUser>(
  {
    openId: { type: String, required: true, unique: true, index: true },
    name: String,
    email: String,
    loginMethod: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    lastSignedIn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);

// Category Schema
export interface ICategory extends Document {
  name: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, index: true },
    description: String,
    image: String,
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategory>("Category", categorySchema);

// Product Schema
export interface IProduct extends Document {
  name: string;
  description?: string;
  productCode?: string;
  categoryId: mongoose.Types.ObjectId;
  price: number;
  originalPrice?: number;
  image?: string;
  images?: string[];
  stock: number;
  minQuantity?: number;
  costPrice?: number;
  salePrice?: number;
  discount?: number;
  profitPercentage?: number;
  active?: boolean;
  status: "available" | "unavailable" | "coming_soon";
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    description: String,
    productCode: { type: String, unique: true, sparse: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true },
    originalPrice: Number,
    image: String,
    images: [String],
    stock: { type: Number, default: 0 },
    minQuantity: Number,
    costPrice: Number,
    salePrice: Number,
    discount: Number,
    profitPercentage: Number,
    active: { type: Boolean, default: true },
    status: { type: String, enum: ["available", "unavailable", "coming_soon"], default: "available" },
    tags: [String],
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", productSchema);

// Cart Item Schema
export interface ICartItem extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export const CartItem = mongoose.model<ICartItem>("CartItem", cartItemSchema);

// Order Schema
export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
    paymentMethod: { type: String, default: "cash_on_delivery" },
    notes: String,
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);

// Order Item Schema
export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

export const OrderItem = mongoose.model<IOrderItem>("OrderItem", orderItemSchema);
