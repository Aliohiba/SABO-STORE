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

export const AdminUser = mongoose.models.AdminUser || mongoose.model<IAdminUser>("AdminUser", adminUserSchema);

// Order Settings Schema
export interface IOrderSettings extends Document {
  autoAcceptOrders: boolean;
  allowPartialPaymentCash: boolean;
  allowPartialPaymentElectronic: boolean;
  preferredDeliveryCompany: string;
  showDeliveryPriceBeforeCheckout: boolean;
  showBackupPhoneField: boolean;
  showEmailField: boolean;
  showSubscribeButton: boolean;
  defaultPaymentMethod: "cash" | "immediate";
  createdAt: Date;
  updatedAt: Date;
}

const orderSettingsSchema = new Schema<IOrderSettings>(
  {
    autoAcceptOrders: { type: Boolean, default: false },
    allowPartialPaymentCash: { type: Boolean, default: false },
    allowPartialPaymentElectronic: { type: Boolean, default: false },
    preferredDeliveryCompany: { type: String, default: "darb" },
    showDeliveryPriceBeforeCheckout: { type: Boolean, default: true },
    showBackupPhoneField: { type: Boolean, default: true },
    showEmailField: { type: Boolean, default: true },
    showSubscribeButton: { type: Boolean, default: true },
    defaultPaymentMethod: { type: String, enum: ["cash", "immediate"], default: "cash" },
  },
  { timestamps: true }
);

export const OrderSettings = mongoose.models.OrderSettings || mongoose.model<IOrderSettings>("OrderSettings", orderSettingsSchema);

// Customer Schema
export interface ICustomer extends Document {
  phone: string;
  email?: string; // Optional
  passwordHash: string;
  name: string; // Required
  cityId?: number | string; // City ID from Vanex or Name from Darb
  area?: string; // Area/District
  address?: string; // Optional detailed address
  alternativePhone?: string; // Optional alternative phone
  walletBalance: number; // Customer wallet balance in LYD
  walletNumber?: string; // Unique Wallet Number for easy identification
  isActive: boolean;
  lastLogin?: Date;
  otpCode?: string; // OTP for password reset
  otpExpires?: Date; // Expiry for OTP
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, sparse: true }, // Optional, sparse index allows nulls
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    cityId: { type: Schema.Types.Mixed },
    area: { type: String },
    address: { type: String },
    alternativePhone: { type: String },
    walletBalance: { type: Number, default: 0 },
    walletNumber: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
    otpCode: { type: String, select: false }, // Don't return by default
    otpExpires: { type: Date, select: false },
    emailVerified: { type: Boolean, default: false },
    emailVerificationCode: { type: String, select: false },
    emailVerificationExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>("Customer", customerSchema);

// User Schema
export interface IUser extends Document {
  openId: string;
  name?: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
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
    email: { type: String, index: true },
    phone: String,
    passwordHash: String,
    loginMethod: String,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    lastSignedIn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

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

export const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", categorySchema);

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
  status: "displayed" | "hidden";
  tags?: string[];
  options?: any;
  createdAt: Date;
  updatedAt: Date;
  offerEndTime?: Date;
  showActiveOffer?: boolean;
  lowStockThreshold?: number;
  video?: string; // رابط الفيديو أو Base64
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
    status: { type: String, enum: ["displayed", "hidden"], default: "displayed" },
    tags: [String],
    options: { type: Schema.Types.Mixed },
    offerEndTime: Date,
    showActiveOffer: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 5 },
    video: String, // تخزين الرابط أو البيانات
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

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

export const CartItem = mongoose.models.CartItem || mongoose.model<ICartItem>("CartItem", cartItemSchema);

// Order Schema
export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  orderNumber: string;
  customerName: string;
  customerEmail?: string; // Optional
  customerPhone: string;
  customerAddress?: string; // Optional
  totalAmount: number;
  cityId: number | string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  notes?: string;
  trackingCode?: string;
  trackingKey?: string; // Public tracking key for order lookup
  vanexOrderId?: string;
  deliveryCompanyId?: string;
  isPaid?: boolean;
  paymentDetails?: any;
  area?: string;
  cashbackAwarded?: boolean;
  shippingCost?: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    orderNumber: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String }, // Optional
    customerPhone: { type: String, required: true },
    customerAddress: { type: String }, // Optional
    cityId: { type: Schema.Types.Mixed },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
    paymentMethod: { type: String, default: "cash_on_delivery" },
    notes: String,
    trackingCode: String,
    trackingKey: { type: String, unique: true, sparse: true, index: true },
    vanexOrderId: String,
    deliveryCompanyId: String,
    isPaid: { type: Boolean, default: false },
    paymentDetails: { type: Schema.Types.Mixed }, // Added paymentDetails field
    area: String,
    cashbackAwarded: { type: Boolean, default: false },
    shippingCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

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


export const OrderItem = mongoose.models.OrderItem || mongoose.model<IOrderItem>("OrderItem", orderItemSchema);

// Wallet Schema
export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "LYD" },
  },
  { timestamps: true }
);

export const Wallet = mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", walletSchema);

// Wallet Transaction Schema (linked directly to Customer)
export interface IWalletTransaction extends Document {
  customerId: mongoose.Types.ObjectId;
  type: "deposit" | "withdrawal" | "payment" | "refund" | "admin_add" | "admin_deduct";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  referenceId?: string; // e.g. Order ID
  status: "pending" | "completed" | "failed";
  createdBy?: string; // Admin username if admin transaction
  createdAt: Date;
}

const WalletTransactionSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'payment', 'refund', 'admin_add', 'admin_deduct', 'cashback'],
    required: true
  },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  description: { type: String },
  referenceId: { type: String }, // e.g., Order ID
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  createdBy: { type: String }, // Admin ID or System
}, { timestamps: true });

export const WalletTransaction = mongoose.model<IWalletTransaction>('WalletTransaction', WalletTransactionSchema);

// Exchange Rate Cache Schema
export interface IExchangeRateCache extends Document {
  key: string; // usually 'default' or currency pair
  data: any;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExchangeRateCacheSchema = new mongoose.Schema({
  key: { type: String, default: 'default', unique: true },
  data: { type: mongoose.Schema.Types.Mixed },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export const ExchangeRateCache = mongoose.models.ExchangeRateCache || mongoose.model<IExchangeRateCache>('ExchangeRateCache', ExchangeRateCacheSchema);


// Store Settings Schema
const StoreSettingsSchema = new mongoose.Schema({
  storeName: { type: String, default: "Sabo Store" },
  // Backward compatibility & new fields
  description: { type: String },
  storeDescription: { type: String },

  phoneNumber: { type: String }, // Old field
  address: { type: String }, // Old field

  // Media
  logoUrl: { type: String }, // Old field
  storeLogo: { type: String },
  favicon: { type: String },
  banners: [String],

  // Legacy Hero fields (can generate banners from these if needed, but keeping for now)
  heroTitle: { type: String },
  heroSubtitle: { type: String },
  heroImage: { type: String },

  announcementBar: { type: String },
  currency: { type: String, default: 'LYD' },
  isMaintenanceMode: { type: Boolean, default: false },

  // Featured Sections
  featuredSections: [{
    title: String,
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  }],

  // Social Media
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    tiktok: String,
    youtube: String,
    whatsapp: String,
    linkedin: String,
  },
  // Legacy social fields
  facebookUrl: { type: String },
  instagramUrl: { type: String },
  tiktokUrl: { type: String },

  // Footer
  footer: {
    aboutText: String,
    email: String,
    phone: String,
    copyright: String,
    paymentText: String,
    quickLinks: [{
      label: String,
      url: String
    }]
  },

  // Delivery Providers
  deliveryProviders: {
    vanex: { type: Boolean, default: true },
    darb: { type: Boolean, default: true },
  },

  // Payment Methods
  paymentMethods: {
    cash_on_delivery: { type: Boolean, default: true },
    moamalat: { type: Boolean, default: true },
    lypay: { type: Boolean, default: false },
  },

  // Wallet & Cashback Settings
  walletSettings: {
    cashbackEnabled: { type: Boolean, default: false },
    cashbackPercentage: { type: Number, default: 0 },
    minOrderValueForCashback: { type: Number, default: 0 },
    minProductsCountForCashback: { type: Number, default: 0 },
    applyCashbackOn: { type: String, enum: ['subtotal', 'total'], default: 'subtotal' }
  },

  // Theme Settings
  theme: {
    template: { type: String, enum: ['default', 'dark', 'modern'], default: 'default' },
    primaryColor: { type: String, default: '#3b82f6' }, // blue-500
    secondaryColor: { type: String, default: '#1e293b' }, // slate-800
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#0f172a' }, // slate-900
    headerColor: { type: String },
    footerColor: { type: String },
    buttonRadius: { type: String, default: '0.5rem' },
  },

  hideCategoryNames: { type: Boolean, default: false }
}, { timestamps: true });

// Store Settings Interface
export interface IStoreSettings extends Document {
  storeName: string;
  description?: string;
  storeDescription?: string;
  phoneNumber?: string;
  address?: string;

  storeLogo?: string;
  logoUrl?: string; // Legacy
  favicon?: string;
  banners?: string[];

  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;

  announcementBar?: string;
  currency: string;
  isMaintenanceMode: boolean;

  featuredSections?: {
    title: string;
    products: mongoose.Types.ObjectId[];
  }[];

  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
    linkedin?: string;
  };
  // Legacy social
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;

  footer?: {
    aboutText?: string;
    email?: string;
    phone?: string;
    copyright?: string;
    paymentText?: string;
    quickLinks?: { label: string; url: string }[];
  };

  deliveryProviders?: {
    vanex?: boolean;
    darb?: boolean;
  };

  paymentMethods?: {
    cash_on_delivery?: boolean;
    moamalat?: boolean;
    lypay?: boolean;
  };

  walletSettings: {
    cashbackEnabled: boolean;
    cashbackPercentage: number;
    minOrderValueForCashback: number;
    minProductsCountForCashback?: number;
    applyCashbackOn: 'subtotal' | 'total';
  };

  theme?: {
    template: 'default' | 'dark' | 'modern';
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    headerColor?: string;
    footerColor?: string;
    buttonRadius: string;
  };

  hideCategoryNames?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const StoreSettings = mongoose.models.StoreSettings || mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema);

// Support Message Schema
export interface ISupportMessage extends Document {
  customerId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "pending" | "replied";
  reply?: string;
  direction?: "inbound" | "outbound";
  createdAt: Date;
  updatedAt: Date;
  repliedAt?: Date;
}

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "replied"], default: "pending" },
    reply: String,
    direction: { type: String, enum: ["inbound", "outbound"], default: "inbound" },
    repliedAt: Date,
  },
  { timestamps: true }
);

export const SupportMessage = mongoose.models.SupportMessage || mongoose.model<ISupportMessage>("SupportMessage", supportMessageSchema);
