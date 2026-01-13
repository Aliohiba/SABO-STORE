CREATE TABLE `adminUsers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`passwordHash` text NOT NULL,
	`email` text,
	`name` text,
	`isActive` integer DEFAULT true NOT NULL,
	`lastLogin` integer,
	`createdAt` integer DEFAULT 1766821395742 NOT NULL,
	`updatedAt` integer DEFAULT 1766821395742 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `adminUsers_username_unique` ON `adminUsers` (`username`);--> statement-breakpoint
CREATE TABLE `cartItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`productId` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`createdAt` integer DEFAULT 1766821395741 NOT NULL,
	`updatedAt` integer DEFAULT 1766821395741 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`image` text,
	`createdAt` integer DEFAULT 1766821395740 NOT NULL,
	`updatedAt` integer DEFAULT 1766821395740 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`orderId` integer NOT NULL,
	`productId` integer NOT NULL,
	`productName` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` real NOT NULL,
	`createdAt` integer DEFAULT 1766821395741 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
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
	`createdAt` integer DEFAULT 1766821395741 NOT NULL,
	`updatedAt` integer DEFAULT 1766821395741 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_orderNumber_unique` ON `orders` (`orderNumber`);--> statement-breakpoint
CREATE TABLE `products` (
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
	`createdAt` integer DEFAULT 1766821395741 NOT NULL,
	`updatedAt` integer DEFAULT 1766821395741 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer DEFAULT 1766821395739 NOT NULL,
	`updatedAt` integer DEFAULT 1766821395739 NOT NULL,
	`lastSignedIn` integer DEFAULT 1766821395739 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);