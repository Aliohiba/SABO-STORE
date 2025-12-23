import mongoose from "mongoose";
import {
  Customer,
  ProductImage,
  ProductOption,
  City,
  DeliveryCompany,
  Shipment,
  OrderTracking,
  ICustomer,
  IProductImage,
  IProductOption,
  ICity,
  IDeliveryCompany,
  IShipment,
  IOrderTracking,
} from "./schemas-extended";

// ==================== Customer Functions ====================
export async function createCustomer(customerData: Partial<ICustomer>): Promise<ICustomer> {
  const customer = new Customer(customerData);
  return customer.save();
}

export async function getCustomerById(id: string): Promise<ICustomer | null> {
  return Customer.findById(id).exec();
}

export async function getCustomerByEmail(email: string): Promise<ICustomer | null> {
  return Customer.findOne({ email }).exec();
}

export async function updateCustomer(id: string, customerData: Partial<ICustomer>): Promise<ICustomer | null> {
  return Customer.findByIdAndUpdate(id, customerData, { new: true }).exec();
}

export async function deleteCustomer(id: string): Promise<ICustomer | null> {
  return Customer.findByIdAndDelete(id).exec();
}

export async function getAllCustomers(): Promise<ICustomer[]> {
  return Customer.find().exec();
}

// ==================== ProductImage Functions ====================
export async function createProductImage(imageData: Partial<IProductImage>): Promise<IProductImage> {
  const image = new ProductImage(imageData);
  return image.save();
}

export async function getProductImages(productId: string): Promise<IProductImage[]> {
  return ProductImage.find({ productId: new mongoose.Types.ObjectId(productId) }).exec();
}

export async function getMainProductImage(productId: string): Promise<IProductImage | null> {
  return ProductImage.findOne({
    productId: new mongoose.Types.ObjectId(productId),
    isMain: true,
  }).exec();
}

export async function updateProductImage(id: string, imageData: Partial<IProductImage>): Promise<IProductImage | null> {
  return ProductImage.findByIdAndUpdate(id, imageData, { new: true }).exec();
}

export async function deleteProductImage(id: string): Promise<IProductImage | null> {
  return ProductImage.findByIdAndDelete(id).exec();
}

// ==================== ProductOption Functions ====================
export async function createProductOption(optionData: Partial<IProductOption>): Promise<IProductOption> {
  const option = new ProductOption(optionData);
  return option.save();
}

export async function getProductOption(id: string): Promise<IProductOption | null> {
  return ProductOption.findById(id).exec();
}

export async function getProductOptionsByType(type: string): Promise<IProductOption[]> {
  return ProductOption.find({ type }).exec();
}

export async function getAllProductOptions(): Promise<IProductOption[]> {
  return ProductOption.find().exec();
}

export async function updateProductOption(id: string, optionData: Partial<IProductOption>): Promise<IProductOption | null> {
  return ProductOption.findByIdAndUpdate(id, optionData, { new: true }).exec();
}

export async function deleteProductOption(id: string): Promise<IProductOption | null> {
  return ProductOption.findByIdAndDelete(id).exec();
}

// ==================== City Functions ====================
export async function createCity(cityData: Partial<ICity>): Promise<ICity> {
  const city = new City(cityData);
  return city.save();
}

export async function getCityById(id: string): Promise<ICity | null> {
  return City.findById(id).exec();
}

export async function getCityByName(name: string): Promise<ICity | null> {
  return City.findOne({ name }).exec();
}

export async function getAllCities(): Promise<ICity[]> {
  return City.find().exec();
}

export async function getActiveCities(): Promise<ICity[]> {
  return City.find({ active: true }).exec();
}

export async function updateCity(id: string, cityData: Partial<ICity>): Promise<ICity | null> {
  return City.findByIdAndUpdate(id, cityData, { new: true }).exec();
}

export async function deleteCity(id: string): Promise<ICity | null> {
  return City.findByIdAndDelete(id).exec();
}

// ==================== DeliveryCompany Functions ====================
export async function createDeliveryCompany(companyData: Partial<IDeliveryCompany>): Promise<IDeliveryCompany> {
  const company = new DeliveryCompany(companyData);
  return company.save();
}

export async function getDeliveryCompanyById(id: string): Promise<IDeliveryCompany | null> {
  return DeliveryCompany.findById(id).exec();
}

export async function getAllDeliveryCompanies(): Promise<IDeliveryCompany[]> {
  return DeliveryCompany.find().exec();
}

export async function getActiveDeliveryCompanies(): Promise<IDeliveryCompany[]> {
  return DeliveryCompany.find({ active: true }).exec();
}

export async function updateDeliveryCompany(id: string, companyData: Partial<IDeliveryCompany>): Promise<IDeliveryCompany | null> {
  return DeliveryCompany.findByIdAndUpdate(id, companyData, { new: true }).exec();
}

export async function deleteDeliveryCompany(id: string): Promise<IDeliveryCompany | null> {
  return DeliveryCompany.findByIdAndDelete(id).exec();
}

// ==================== Shipment Functions ====================
export async function createShipment(shipmentData: Partial<IShipment>): Promise<IShipment> {
  const shipment = new Shipment(shipmentData);
  return shipment.save();
}

export async function getShipmentById(id: string): Promise<IShipment | null> {
  return Shipment.findById(id).populate("orderId").populate("deliveryCompanyId").exec();
}

export async function getShipmentByOrderId(orderId: string): Promise<IShipment | null> {
  return Shipment.findOne({ orderId: new mongoose.Types.ObjectId(orderId) }).exec();
}

export async function getShipmentByTrackingNumber(trackingNumber: string): Promise<IShipment | null> {
  return Shipment.findOne({ trackingNumber }).exec();
}

export async function getAllShipments(): Promise<IShipment[]> {
  return Shipment.find().populate("orderId").populate("deliveryCompanyId").exec();
}

export async function updateShipment(id: string, shipmentData: Partial<IShipment>): Promise<IShipment | null> {
  return Shipment.findByIdAndUpdate(id, shipmentData, { new: true }).exec();
}

export async function deleteShipment(id: string): Promise<IShipment | null> {
  return Shipment.findByIdAndDelete(id).exec();
}

// ==================== OrderTracking Functions ====================
export async function createOrderTracking(trackingData: Partial<IOrderTracking>): Promise<IOrderTracking> {
  const tracking = new OrderTracking(trackingData);
  return tracking.save();
}

export async function getOrderTrackings(orderId: string): Promise<IOrderTracking[]> {
  return OrderTracking.find({ orderId: new mongoose.Types.ObjectId(orderId) })
    .sort({ createdAt: -1 })
    .exec();
}

export async function getLatestOrderTracking(orderId: string): Promise<IOrderTracking | null> {
  return OrderTracking.findOne({ orderId: new mongoose.Types.ObjectId(orderId) })
    .sort({ createdAt: -1 })
    .limit(1)
    .exec();
}

export async function updateOrderTracking(id: string, trackingData: Partial<IOrderTracking>): Promise<IOrderTracking | null> {
  return OrderTracking.findByIdAndUpdate(id, trackingData, { new: true }).exec();
}

export async function deleteOrderTracking(id: string): Promise<IOrderTracking | null> {
  return OrderTracking.findByIdAndDelete(id).exec();
}
