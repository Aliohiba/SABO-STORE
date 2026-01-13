import mongoose, { Schema, Document } from "mongoose";

// ProductImage Schema
export interface IProductImage extends Document {
  productId: mongoose.Types.ObjectId;
  imageUrl: string;
  isMain: boolean;
  createdAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    imageUrl: { type: String, required: true },
    isMain: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ProductImage = mongoose.models.ProductImage || mongoose.model<IProductImage>("ProductImage", productImageSchema);

// ProductOption Schema
export interface IProductOption extends Document {
  type: "COLOR" | "SIZE" | "OTHER";
  value: string;
  createdAt: Date;
}

const productOptionSchema = new Schema<IProductOption>(
  {
    type: { type: String, enum: ["COLOR", "SIZE", "OTHER"], required: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

export const ProductOption = mongoose.models.ProductOption || mongoose.model<IProductOption>("ProductOption", productOptionSchema);

// City Schema
export interface ICity extends Document {
  name: string;
  vanexId?: number;
  darbId?: string;
  deliveryPrice: number;
  darbPrice?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const citySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, unique: true, index: true },
    vanexId: { type: Number, unique: true, sparse: true },
    darbId: { type: String, sparse: true }, // Not unique - multiple cities can be under same branch
    deliveryPrice: { type: Number, required: true }, // Default/Vanex Price
    darbPrice: { type: Number }, // Specific Price for Darb Al-Sabil
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const City = mongoose.models.City || mongoose.model<ICity>("City", citySchema);

// Region Schema
export interface IRegion extends Document {
  cityId: mongoose.Types.ObjectId;
  name: string;
  deliveryPrice?: number;
  darbPrice?: number;
  darbId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const regionSchema = new Schema<IRegion>(
  {
    cityId: { type: Schema.Types.ObjectId, ref: "City", required: true },
    name: { type: String, required: true },
    deliveryPrice: { type: Number }, // Local/Vanex Price specific to region if any
    darbPrice: { type: Number },     // Darb Al-Sabil Price specific to region
    darbId: { type: String },         // b2nPackageId from Darb Al-Sabil
  },
  { timestamps: true }
);

// Compound index to ensure region names are unique per city
regionSchema.index({ cityId: 1, name: 1 }, { unique: true });

export const Region = mongoose.models.Region || mongoose.model<IRegion>("Region", regionSchema);

// DeliveryCompany Schema
export interface IDeliveryCompany extends Document {
  name: string;
  phone?: string;
  apiUrl?: string;
  apiKey?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryCompanySchema = new Schema<IDeliveryCompany>(
  {
    name: { type: String, required: true, unique: true, index: true },
    phone: String,
    apiUrl: String,
    apiKey: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DeliveryCompany = mongoose.models.DeliveryCompany || mongoose.model<IDeliveryCompany>("DeliveryCompany", deliveryCompanySchema);

// Shipment Schema
export interface IShipment extends Document {
  orderId: mongoose.Types.ObjectId;
  deliveryCompanyId: mongoose.Types.ObjectId;
  trackingNumber?: string;
  shippingPrice?: number;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  status: "PENDING" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const shipmentSchema = new Schema<IShipment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    deliveryCompanyId: { type: Schema.Types.ObjectId, ref: "DeliveryCompany" },
    trackingNumber: String,
    shippingPrice: Number,
    estimatedDeliveryDate: Date,
    actualDeliveryDate: Date,
    status: { type: String, enum: ["PENDING", "IN_TRANSIT", "DELIVERED", "CANCELLED"], default: "PENDING" },
  },
  { timestamps: true }
);

export const Shipment = mongoose.models.Shipment || mongoose.model<IShipment>("Shipment", shipmentSchema);

// Update OrderTracking Schema
export interface IOrderTracking extends Document {
  orderId: mongoose.Types.ObjectId;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  note?: string;
  createdAt: Date;
}

const orderTrackingSchema = new Schema<IOrderTracking>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    status: { type: String, enum: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"], required: true },
    note: String,
  },
  { timestamps: true }
);

export const OrderTracking = mongoose.models.OrderTracking || mongoose.model<IOrderTracking>("OrderTracking", orderTrackingSchema);

// Vanex Setting Schema
export interface IVanexSetting extends Document {
  costOnAccount: "customer" | "store";
  additionalCostOnAccount: "customer" | "store";
  commissionOnAccount: "customer" | "store";
  allowInspection: boolean;
  allowMeasurement: boolean;
  isFragile: boolean;
  needsSafePackaging: boolean;
  isHeatSensitive: boolean;
  allow50Note: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vanexSettingSchema = new Schema<IVanexSetting>(
  {
    costOnAccount: { type: String, enum: ["customer", "store"], default: "customer" },
    additionalCostOnAccount: { type: String, enum: ["customer", "store"], default: "customer" },
    commissionOnAccount: { type: String, enum: ["customer", "store"], default: "customer" },
    allowInspection: { type: Boolean, default: false },
    allowMeasurement: { type: Boolean, default: false },
    isFragile: { type: Boolean, default: false },
    needsSafePackaging: { type: Boolean, default: false },
    isHeatSensitive: { type: Boolean, default: false },
    allow50Note: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const VanexSetting = mongoose.models.VanexSetting || mongoose.model<IVanexSetting>("VanexSetting", vanexSettingSchema);

// Featured Section Interface
export interface IFeaturedSection {
  _id?: string; // Add _id for keying in React
  title: string;
  products: mongoose.Types.ObjectId[];
}

// Store Settings Schema
export interface IStoreSettings extends Document {
  storeName?: string;
  storeDescription?: string;
  storeLogo?: string;
  favicon?: string;
  banners?: string[];
  featuredSections?: IFeaturedSection[]; // Changed from single featuredProducts list
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
    linkedin?: string;
  };
  footer: {
    aboutText?: string;
    email?: string;
    phone?: string;
    copyright?: string;
  };
  deliveryProviders?: {
    vanex?: boolean;
    darb?: boolean;
  };
  hideCategoryNames?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const storeSettingsSchema = new Schema<IStoreSettings>(
  {
    storeName: { type: String },
    storeDescription: { type: String },
    storeLogo: { type: String },
    favicon: { type: String },
    banners: [{ type: String }],
    featuredSections: [
      {
        title: { type: String, required: true },
        products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      }
    ],
    socialMedia: {
      facebook: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      tiktok: { type: String },
      youtube: { type: String },
      whatsapp: { type: String },
      linkedin: { type: String },
    },
    footer: {
      aboutText: { type: String },
      email: { type: String },
      phone: { type: String },
      copyright: { type: String },
    },
    deliveryProviders: {
      vanex: { type: Boolean, default: true },
      darb: { type: Boolean, default: true },
    },
    hideCategoryNames: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const StoreSettings = mongoose.models.StoreSettings || mongoose.model<IStoreSettings>("StoreSettings", storeSettingsSchema);

