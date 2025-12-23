import mongoose from "mongoose";
import {
  AdminUser,
  User,
  Category,
  Product,
  CartItem,
  Order,
  OrderItem,
  IAdminUser,
  IUser,
  ICategory,
  IProduct,
  ICartItem,
  IOrder,
  IOrderItem,
} from "./schemas";

// Admin functions
export async function getAdminByUsername(username: string): Promise<IAdminUser | null> {
  return AdminUser.findOne({ username }).exec();
}

export async function createAdminUser(adminData: Partial<IAdminUser>): Promise<IAdminUser> {
  const admin = new AdminUser(adminData);
  return admin.save();
}

export async function updateAdminPassword(id: string, passwordHash: string): Promise<IAdminUser | null> {
  return AdminUser.findByIdAndUpdate(id, { passwordHash }, { new: true }).exec();
}

// User functions
export async function upsertUser(user: Partial<IUser>): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const existingUser = await User.findOne({ openId: user.openId });
  if (existingUser) {
    Object.assign(existingUser, user);
    await existingUser.save();
  } else {
    const newUser = new User(user);
    await newUser.save();
  }
}

export async function getUserByOpenId(openId: string): Promise<IUser | null> {
  return User.findOne({ openId }).exec();
}

// Product functions
export async function getProducts(limit = 20, offset = 0): Promise<IProduct[]> {
  return Product.find().limit(limit).skip(offset).exec();
}

export async function getProductById(id: string): Promise<IProduct | null> {
  return Product.findById(id).exec();
}

export async function searchProducts(query: string, limit = 20, offset = 0): Promise<IProduct[]> {
  return Product.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  })
    .limit(limit)
    .skip(offset)
    .exec();
}

export async function getProductsByCategory(categoryId: string, limit = 20, offset = 0): Promise<IProduct[]> {
  return Product.find({ categoryId: new mongoose.Types.ObjectId(categoryId) })
    .limit(limit)
    .skip(offset)
    .exec();
}

export async function createProduct(productData: Partial<IProduct>): Promise<IProduct> {
  const product = new Product(productData);
  return product.save();
}

export async function updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct | null> {
  return Product.findByIdAndUpdate(id, productData, { new: true }).exec();
}

export async function deleteProduct(id: string): Promise<IProduct | null> {
  return Product.findByIdAndDelete(id).exec();
}

// Category functions
export async function getCategories(): Promise<ICategory[]> {
  return Category.find().exec();
}

export async function getCategoryById(id: string): Promise<ICategory | null> {
  return Category.findById(id).exec();
}

export async function createCategory(categoryData: Partial<ICategory>): Promise<ICategory> {
  const category = new Category(categoryData);
  return category.save();
}

export async function updateCategory(id: string, categoryData: Partial<ICategory>): Promise<ICategory | null> {
  return Category.findByIdAndUpdate(id, categoryData, { new: true }).exec();
}

export async function deleteCategory(id: string): Promise<ICategory | null> {
  return Category.findByIdAndDelete(id).exec();
}

// Cart functions
export async function getCartItems(userId: string): Promise<ICartItem[]> {
  return CartItem.find({ userId: new mongoose.Types.ObjectId(userId) })
    .populate("productId")
    .exec();
}

export async function addCartItem(userId: string, productId: string, quantity: number): Promise<ICartItem> {
  const existingItem = await CartItem.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    productId: new mongoose.Types.ObjectId(productId),
  });

  if (existingItem) {
    existingItem.quantity += quantity;
    return existingItem.save();
  }

  const cartItem = new CartItem({
    userId: new mongoose.Types.ObjectId(userId),
    productId: new mongoose.Types.ObjectId(productId),
    quantity,
  });
  return cartItem.save();
}

export async function removeCartItem(id: string): Promise<ICartItem | null> {
  return CartItem.findByIdAndDelete(id).exec();
}

export async function updateCartItemQuantity(id: string, quantity: number): Promise<ICartItem | null> {
  return CartItem.findByIdAndUpdate(id, { quantity }, { new: true }).exec();
}

export async function clearCart(userId: string): Promise<void> {
  await CartItem.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
}

// Order functions
export async function createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
  const order = new Order(orderData);
  return order.save();
}

export async function getOrderById(id: string): Promise<IOrder | null> {
  return Order.findById(id).exec();
}

export async function getOrderByNumber(orderNumber: string): Promise<IOrder | null> {
  return Order.findOne({ orderNumber }).exec();
}

export async function getUserOrders(userId: string): Promise<IOrder[]> {
  return Order.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
}

export async function getAllOrders(): Promise<IOrder[]> {
  return Order.find().sort({ createdAt: -1 }).exec();
}

export async function updateOrderStatus(id: string, status: IOrder["status"]): Promise<IOrder | null> {
  return Order.findByIdAndUpdate(id, { status }, { new: true }).exec();
}

// Order Item functions

// ==================== Report Functions ====================

export async function getSalesMetrics(startDate: Date, endDate: Date): Promise<{ totalSales: number, netProfit: number, totalOrders: number }> {
  // 1. Get all delivered orders within the date range
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: "DELIVERED", // Assuming only delivered orders count as sales
  }).exec();

  const orderIds = orders.map(order => order._id);

  // 2. Get all order items for these orders
  const orderItems = await OrderItem.find({
    orderId: { $in: orderIds },
  }).exec();

  let totalSales = 0;
  let totalCost = 0;

  for (const item of orderItems) {
    // Assuming IOrderItem has salePrice and costPrice
    totalSales += item.salePrice * item.quantity;
    totalCost += item.costPrice * item.quantity;
  }

  const netProfit = totalSales - totalCost;
  const totalOrders = orders.length;

  return {
    totalSales,
    netProfit,
    totalOrders,
  };
}

export async function getInventoryValuation(): Promise<{ totalCostValue: number, totalSaleValue: number }> {
  // 1. Get all active products
  const products = await Product.find({ active: true }).exec();

  let totalCostValue = 0;
  let totalSaleValue = 0;

  for (const product of products) {
    // Assuming IProduct has quantity, costPrice, and salePrice
    totalCostValue += product.quantity * product.costPrice;
    totalSaleValue += product.quantity * product.salePrice;
  }

  return {
    totalCostValue,
    totalSaleValue,
  };
}

// Order Item functions
export async function createOrderItem(itemData: Partial<IOrderItem>): Promise<IOrderItem> {
  const item = new OrderItem(itemData);
  return item.save();
}

export async function getOrderItems(orderId: string): Promise<IOrderItem[]> {
  return OrderItem.find({ orderId: new mongoose.Types.ObjectId(orderId) }).exec();
}
