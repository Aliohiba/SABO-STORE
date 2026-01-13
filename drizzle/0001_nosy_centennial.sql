PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_adminUsers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`passwordHash` text NOT NULL,
	`email` text,
	`name` text,
	`isActive` integer DEFAULT true NOT NULL,
	`lastLogin` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_adminUsers`("id", "username", "passwordHash", "email", "name", "isActive", "lastLogin", "createdAt", "updatedAt") SELECT "id", "username", "passwordHash", "email", "name", "isActive", "lastLogin", "createdAt", "updatedAt" FROM `adminUsers`;--> statement-breakpoint
DROP TABLE `adminUsers`;--> statement-breakpoint
ALTER TABLE `__new_adminUsers` RENAME TO `adminUsers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `adminUsers_username_unique` ON `adminUsers` (`username`);--> statement-breakpoint
CREATE TABLE `__new_cartItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`productId` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_cartItems`("id", "userId", "productId", "quantity", "createdAt", "updatedAt") SELECT "id", "userId", "productId", "quantity", "createdAt", "updatedAt" FROM `cartItems`;--> statement-breakpoint
DROP TABLE `cartItems`;--> statement-breakpoint
ALTER TABLE `__new_cartItems` RENAME TO `cartItems`;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "description", "image", "createdAt", "updatedAt") SELECT "id", "name", "description", "image", "createdAt", "updatedAt" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `__new_orderItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orderId` integer NOT NULL,
	`productId` integer NOT NULL,
	`productName` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` real NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_orderItems`("id", "orderId", "productId", "productName", "quantity", "price", "createdAt") SELECT "id", "orderId", "productId", "productName", "quantity", "price", "createdAt" FROM `orderItems`;--> statement-breakpoint
DROP TABLE `orderItems`;--> statement-breakpoint
ALTER TABLE `__new_orderItems` RENAME TO `orderItems`;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer,
	`orderNumber` text NOT NULL,
	`customerName` text NOT NULL,
	`customerEmail` text NOT NULL,
	`customerPhone` text NOT NULL,
	`customerAddress` text NOT NULL,
	`totalAmount` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`paymentMethod` text DEFAULT 'cash_on_delivery' NOT NULL,
	`notes` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "userId", "orderNumber", "customerName", "customerEmail", "customerPhone", "customerAddress", "totalAmount", "status", "paymentMethod", "notes", "createdAt", "updatedAt") SELECT "id", "userId", "orderNumber", "customerName", "customerEmail", "customerPhone", "customerAddress", "totalAmount", "status", "paymentMethod", "notes", "createdAt", "updatedAt" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
CREATE UNIQUE INDEX `orders_orderNumber_unique` ON `orders` (`orderNumber`);--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`categoryId` integer NOT NULL,
	`price` real NOT NULL,
	`originalPrice` real,
	`image` text,
	`images` text,
	`stock` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`tags` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "name", "description", "categoryId", "price", "originalPrice", "image", "images", "stock", "status", "tags", "createdAt", "updatedAt") SELECT "id", "name", "description", "categoryId", "price", "originalPrice", "image", "images", "stock", "status", "tags", "createdAt", "updatedAt" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "openId", "name", "email", "loginMethod", "role", "createdAt", "updatedAt", "lastSignedIn") SELECT "id", "openId", "name", "email", "loginMethod", "role", "createdAt", "updatedAt", "lastSignedIn" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);