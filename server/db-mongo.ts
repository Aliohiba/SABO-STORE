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
  IWallet,
  IWalletTransaction,
  Wallet,
  WalletTransaction,
  Customer,
  SupportMessage,
  ISupportMessage,
  ICustomer
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

export async function getAllAdminUsers(): Promise<IAdminUser[]> {
  return AdminUser.find().sort({ createdAt: -1 }).lean().exec() as any;
}

export async function getAdminById(id: string): Promise<IAdminUser | null> {
  return AdminUser.findById(id).lean().exec() as any;
}

export async function updateAdminUser(id: string, adminData: Partial<IAdminUser>): Promise<IAdminUser | null> {
  return AdminUser.findByIdAndUpdate(id, adminData, { new: true }).exec();
}

export async function deleteAdminUser(id: string): Promise<IAdminUser | null> {
  return AdminUser.findByIdAndDelete(id).exec();
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

export async function getUserByEmail(email: string): Promise<IUser | null> {
  return User.findOne({ email }).exec();
}

export async function createUser(userData: Partial<IUser>): Promise<IUser> {
  const user = new User(userData);
  return user.save();
}

// Helper to expire offers automatically
async function checkAndExpireOffers() {
  try {
    const now = new Date();
    // Find products with active offers that have expired
    const expiredProducts = await Product.find({
      showActiveOffer: true,
      offerEndTime: { $lt: now }
    });

    if (expiredProducts.length > 0) {
      console.log(`[Offers] Found ${expiredProducts.length} expired offers. Expiring...`);
      const updates = expiredProducts.map(async (p) => {
        p.showActiveOffer = false;
        p.offerEndTime = undefined;
        // Revert price if originalPrice exists (meaning it was discounted)
        if (p.originalPrice && p.originalPrice > p.price) {
          p.price = p.originalPrice;
          p.originalPrice = undefined; // Remove the "was" price
        }
        await p.save();
      });
      await Promise.all(updates);
      console.log(`[Offers] Expired ${expiredProducts.length} offers successfully.`);
    }
  } catch (err) {
    console.error("[Offers] Error checking expired offers:", err);
  }
}

// Product functions
export async function getProducts(limit = 20, offset = 0, showActiveOffer?: boolean): Promise<IProduct[]> {
  // Check for expired offers before listing
  await checkAndExpireOffers();

  const filter: any = { status: 'displayed' }; // Only show displayed products
  if (showActiveOffer) {
    filter.showActiveOffer = true;
  }
  return Product.find(filter).limit(limit).skip(offset).exec();
}

// Admin: Get ALL products without filtering (for admin panel)
export async function getAllProducts(limit = 100, offset = 0): Promise<IProduct[]> {
  await checkAndExpireOffers();
  return Product.find({}).limit(limit).skip(offset).exec();
}

export async function getProductsByIds(ids: string[]): Promise<IProduct[]> {
  const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
  return Product.find({ _id: { $in: objectIds }, status: 'displayed' }).exec();
}

export async function getProductById(id: string): Promise<IProduct | null> {
  // Check for expired offer before showing details
  const product = await Product.findById(id).exec();

  if (product && product.showActiveOffer && product.offerEndTime) {
    const now = new Date();
    if (new Date(product.offerEndTime) < now) {
      console.log(`[Offers] Product ${id} offer expired on view. Resetting.`);
      product.showActiveOffer = false;
      product.offerEndTime = undefined;
      if (product.originalPrice && product.originalPrice > product.price) {
        product.price = product.originalPrice;
        product.originalPrice = undefined;
      }
      await product.save();
    }
  }

  return product;
}

export async function searchProducts(query: string, limit = 20, offset = 0): Promise<IProduct[]> {
  return Product.find({
    status: 'displayed', // Only search displayed products
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
  return Product.find({
    categoryId: new mongoose.Types.ObjectId(categoryId),
    status: 'displayed' // Only show displayed products
  })
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

// Helper function to extract ObjectId from customer_ prefix
function extractCustomerId(userId: string): mongoose.Types.ObjectId {
  // If userId starts with "customer_", extract the ObjectId part
  if (userId.startsWith("customer_")) {
    return new mongoose.Types.ObjectId(userId.replace("customer_", ""));
  }
  // Otherwise, assume it's already an ObjectId string
  return new mongoose.Types.ObjectId(userId);
}

// Cart functions
export async function getCartItems(userId: string): Promise<ICartItem[]> {
  return CartItem.find({ userId: extractCustomerId(userId) })
    .populate("productId")

    .lean()
    .exec() as any; // Cast to any to avoid lean type mismatch with interface
}

export async function addCartItem(userId: string, productId: string, quantity: number): Promise<ICartItem> {
  const existingItem = await CartItem.findOne({
    userId: extractCustomerId(userId),
    productId: new mongoose.Types.ObjectId(productId),
  });

  if (existingItem) {
    existingItem.quantity += quantity;
    return existingItem.save();
  }

  const cartItem = new CartItem({
    userId: extractCustomerId(userId),
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
  await CartItem.deleteMany({ userId: extractCustomerId(userId) });
}

// Order functions
export async function createOrder(orderData: Partial<IOrder>): Promise<IOrder> {
  const order = new Order(orderData);
  return order.save();
}

export async function getOrderById(id: string): Promise<IOrder | null> {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return Order.findById(id).lean().exec() as any;
  }
  return Order.findOne({ orderNumber: id }).lean().exec() as any;
}

export async function getOrderByNumber(orderNumber: string): Promise<IOrder | null> {
  return Order.findOne({ orderNumber }).exec();
}

export async function getUserOrders(userId: string): Promise<IOrder[]> {
  return Order.find({ userId: extractCustomerId(userId) }).sort({ createdAt: -1 }).exec();
}

export async function getAllOrders(): Promise<IOrder[]> {
  return Order.find().sort({ createdAt: -1 }).lean().exec() as any;
}

export async function updateOrderStatus(id: string, status: IOrder["status"]): Promise<IOrder | null> {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return Order.findByIdAndUpdate(id, { status }, { new: true }).exec();
  }
  return Order.findOneAndUpdate({ orderNumber: id }, { status }, { new: true }).exec();
}

export async function updateOrderTracking(id: string, trackingCode: string, vanexOrderId: string): Promise<IOrder | null> {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return Order.findByIdAndUpdate(id, { trackingCode, vanexOrderId }, { new: true }).exec();
  }
  return Order.findOneAndUpdate({ orderNumber: id }, { trackingCode, vanexOrderId }, { new: true }).exec();
}

// Order Item functions

// ==================== Report Functions ====================

export async function getSalesMetrics(startDate: Date, endDate: Date): Promise<{ totalSales: number, netProfit: number, totalOrders: number }> {
  // 1. Get all delivered orders within the date range
  // Match status "delivered" (lowercase per schema)
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: "delivered",
  }).exec();

  const orderIds = orders.map(order => order._id);

  // 2. Get all order items for these orders and populate product to get the cost price
  const orderItems = await OrderItem.find({
    orderId: { $in: orderIds },
  }).populate("productId").exec();

  let totalSales = 0;
  let totalCost = 0;

  for (const item of orderItems) {
    // item.price is the selling price at the time of order
    totalSales += (item.price || 0) * item.quantity;

    // costPrice is on the Product model (referenced by productId)
    // Note: This uses CURRENT cost price. Historic cost is not tracked on OrderItem.
    const product = item.productId as unknown as IProduct;
    const costPrice = product?.costPrice || 0;
    totalCost += costPrice * item.quantity;
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
  // ... existing implementation ...
  // 1. Get all active products
  const products = await Product.find({ active: true }).exec();

  let totalCostValue = 0;
  let totalSaleValue = 0;

  for (const product of products) {
    // Schema uses 'stock', 'costPrice', and 'price' (std selling price)
    // We treat 'salePrice' as an optional override or alternate field, but 'price' is the required main price.
    // Use stock || 0 to be safe.
    const qty = product.stock || 0;
    const cost = product.costPrice || 0;
    const price = product.price || 0;

    totalCostValue += qty * cost;
    totalSaleValue += qty * price;
  }

  return {
    totalCostValue,
    totalSaleValue,
  };
}

export async function getDetailedSalesReport(startDate: Date, endDate: Date) {
  // 1. Get all delivered orders
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
    status: "delivered",
  }).exec();

  const orderIds = orders.map(o => o._id);

  // 2. Get items
  const items = await OrderItem.find({ orderId: { $in: orderIds } }).populate("productId").exec();

  // 3. Aggregate by Product
  const productMap = new Map<string, {
    productName: string,
    quantity: number,
    totalSales: number,
    totalCost: number,
    unitCost: number,
    unitPrice: number
  }>();

  for (const item of items) {
    const productId = item.productId._id.toString();
    const product = item.productId as unknown as IProduct;

    // Cost is current cost (limitation of system)
    const cost = product.costPrice || 0;
    const sale = item.price; // Sold price

    if (!productMap.has(productId)) {
      productMap.set(productId, {
        productName: item.productName,
        quantity: 0,
        totalSales: 0,
        totalCost: 0,
        unitCost: cost,
        unitPrice: 0 // Will calculate avg
      });
    }

    const entry = productMap.get(productId)!;
    entry.quantity += item.quantity;
    entry.totalSales += (sale * item.quantity);
    entry.totalCost += (cost * item.quantity);
  }

  // Convert to array
  const reportItems = Array.from(productMap.values()).map(p => ({
    ...p,
    netProfit: p.totalSales - p.totalCost,
    avgPrice: p.quantity > 0 ? p.totalSales / p.quantity : 0
  }));

  const summary = {
    totalSales: reportItems.reduce((sum, i) => sum + i.totalSales, 0),
    totalCost: reportItems.reduce((sum, i) => sum + i.totalCost, 0),
    netProfit: reportItems.reduce((sum, i) => sum + i.netProfit, 0),
    totalItems: reportItems.reduce((sum, i) => sum + i.quantity, 0)
  };

  return { items: reportItems, summary };
}

export async function getCustomerById(id: string): Promise<ICustomer | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Customer.findById(id).exec();
}

// Order Item functions
export async function createOrderItem(itemData: Partial<IOrderItem>): Promise<IOrderItem> {
  const item = new OrderItem(itemData);
  return item.save();
}


export async function getOrderItems(orderId: string): Promise<IOrderItem[]> {
  return OrderItem.find({ orderId: new mongoose.Types.ObjectId(orderId) }).exec();
}

// ==================== Wallet Functions ====================
export async function getWallet(userId: string): Promise<IWallet> {
  const oid = extractCustomerId(userId);

  // 1. Try to find Customer first (Single Source of Truth)
  const customer = await Customer.findById(oid);

  if (customer) {
    // Sync logic: Update or create Wallet doc to match Customer balance
    let wallet = await Wallet.findOne({ userId: oid });
    if (!wallet) {
      wallet = new Wallet({
        userId: oid,
        balance: customer.walletBalance || 0,
        currency: 'LYD'
      });
    } else {
      // Force update wallet from customer
      wallet.balance = customer.walletBalance || 0;
    }
    await wallet.save();
    return wallet;
  }

  // 2. Fallback for non-customer users
  let wallet = await Wallet.findOne({ userId: oid });
  if (!wallet) {
    wallet = new Wallet({ userId: oid });
    await wallet.save();
  }
  return wallet;
}

export async function getWalletTransactions(userId: string): Promise<IWalletTransaction[]> {
  const oid = extractCustomerId(userId);
  // Using customerId for lookup as per new schema usage
  return WalletTransaction.find({ customerId: oid }).sort({ createdAt: -1 }).exec();
}

export async function addWalletTransaction(
  userId: string,
  type: "deposit" | "withdrawal" | "payment" | "refund",
  amount: number,
  description?: string,
  referenceId?: string
): Promise<IWalletTransaction> {
  const oid = extractCustomerId(userId);
  const customer = await Customer.findById(oid);

  if (!customer) throw new Error("Customer not found for wallet transaction");

  const balanceBefore = customer.walletBalance || 0;
  let balanceAfter = balanceBefore;

  if (type === "deposit" || type === "refund") {
    balanceAfter += amount;
  } else if (type === "withdrawal" || type === "payment") {
    balanceAfter -= amount;
  }

  // Update Customer Balance
  customer.walletBalance = balanceAfter;
  await customer.save();

  // Create Transaction linked to Customer
  const transaction = new WalletTransaction({
    customerId: oid,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    description,
    referenceId,
    status: "completed"
  });
  await transaction.save();

  // Sync Wallet doc just in case
  const wallet = await Wallet.findOne({ userId: oid });
  if (wallet) {
    wallet.balance = balanceAfter;
    await wallet.save();
  }

  return transaction;
}

export async function updateOrderPaymentStatus(orderId: string, isPaid: boolean, paymentDetails: any) {
  const updateData = {
    isPaid,
    paymentDetails,
    updatedAt: new Date()
  };

  if (mongoose.Types.ObjectId.isValid(orderId)) {
    return Order.findByIdAndUpdate(orderId, updateData, { new: true });
  }
  return Order.findOneAndUpdate({ orderNumber: orderId }, updateData, { new: true });
}

// ==================== Support Message Functions ====================
export async function createSupportMessage(messageData: Partial<ISupportMessage>): Promise<ISupportMessage> {
  const message = new SupportMessage(messageData);
  return message.save();
}

export async function getAllSupportMessages(): Promise<ISupportMessage[]> {
  return SupportMessage.find().sort({ createdAt: -1 }).exec();
}

export async function getSupportMessageById(id: string): Promise<ISupportMessage | null> {
  return SupportMessage.findById(id).exec();
}

export async function getSupportMessagesForUser(email?: string, customerId?: string): Promise<ISupportMessage[]> {
  const query: any = { $or: [] };

  if (email) {
    query.$or.push({ email });
  }

  if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
    query.$or.push({ customerId: new mongoose.Types.ObjectId(customerId) });
  }

  if (query.$or.length === 0) {
    return [];
  }

  return SupportMessage.find(query).sort({ createdAt: -1 }).exec();
}

export async function updateSupportMessage(id: string, updateData: Partial<ISupportMessage>): Promise<ISupportMessage | null> {
  return SupportMessage.findByIdAndUpdate(id, updateData, { new: true }).exec();
}
