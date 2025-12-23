import mongoose, { Schema, Document } from "mongoose";

// Customer Schema
export interface ICustomer extends Document {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: String,
    address: String,
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>("Customer", customerSchema);

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

export const ProductImage = mongoose.model<IProductImage>("ProductImage", productImageSchema);

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

export const ProductOption = mongoose.model<IProductOption>("ProductOption", productOptionSchema);

// City Schema
export interface ICity extends Document {
  name: string;
  deliveryPrice: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const citySchema = new Schema<ICity>(
  {
    name: { type: String, required: true, unique: true, index: true },
    deliveryPrice: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const City = mongoose.model<ICity>("City", citySchema);

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

export const DeliveryCompany = mongoose.model<IDeliveryCompany>("DeliveryCompany", deliveryCompanySchema);

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

export const Shipment = mongoose.model<IShipment>("Shipment", shipmentSchema);

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

export const OrderTracking = mongoose.model<IOrderTracking>("OrderTracking", orderTrackingSchema);
