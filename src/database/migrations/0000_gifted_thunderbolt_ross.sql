CREATE TABLE `cash_drawer_balance` (
	`id` text PRIMARY KEY NOT NULL,
	`notes_5000` integer DEFAULT 0 NOT NULL,
	`notes_2000` integer DEFAULT 0 NOT NULL,
	`notes_1000` integer DEFAULT 0 NOT NULL,
	`notes_500` integer DEFAULT 0 NOT NULL,
	`notes_100` integer DEFAULT 0 NOT NULL,
	`notes_50` integer DEFAULT 0 NOT NULL,
	`notes_20` integer DEFAULT 0 NOT NULL,
	`coins_10` integer DEFAULT 0 NOT NULL,
	`coins_5` integer DEFAULT 0 NOT NULL,
	`coins_2` integer DEFAULT 0 NOT NULL,
	`coins_1` integer DEFAULT 0 NOT NULL,
	`total_amount` real NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`last_event_id` text,
	`last_updated_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`last_event_id`) REFERENCES `cash_drawer_events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`last_updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cashdrawer_balance_id_idx` ON `cash_drawer_balance` (`id`);--> statement-breakpoint
CREATE INDEX `cashdrawer_balance_last_event_id_idx` ON `cash_drawer_balance` (`last_event_id`);--> statement-breakpoint
CREATE INDEX `cashdrawer_balance_last_updated_by_idx` ON `cash_drawer_balance` (`last_updated_by`);--> statement-breakpoint
CREATE TABLE `cash_drawer_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`total_amount` real NOT NULL,
	`notes_5000` integer DEFAULT 0 NOT NULL,
	`notes_2000` integer DEFAULT 0 NOT NULL,
	`notes_1000` integer DEFAULT 0 NOT NULL,
	`notes_500` integer DEFAULT 0 NOT NULL,
	`notes_100` integer DEFAULT 0 NOT NULL,
	`notes_50` integer DEFAULT 0 NOT NULL,
	`notes_20` integer DEFAULT 0 NOT NULL,
	`coins_10` integer DEFAULT 0 NOT NULL,
	`coins_5` integer DEFAULT 0 NOT NULL,
	`coins_2` integer DEFAULT 0 NOT NULL,
	`coins_1` integer DEFAULT 0 NOT NULL,
	`transaction_id` text,
	`user_id` text NOT NULL,
	`description` text,
	`previous_balance` real,
	`new_balance` real,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `cashdrawer_event_id_idx` ON `cash_drawer_events` (`id`);--> statement-breakpoint
CREATE INDEX `cashdrawer_event_transaction_id_idx` ON `cash_drawer_events` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `cashdrawer_event_user_id_idx` ON `cash_drawer_events` (`user_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE INDEX `categories_name_idx` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`address` text,
	`total_credit_limit` real DEFAULT 0,
	`current_balance` real DEFAULT 0 NOT NULL,
	`notes` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `customers_name_idx` ON `customers` (`name`);--> statement-breakpoint
CREATE INDEX `customers_phone_idx` ON `customers` (`phone`);--> statement-breakpoint
CREATE INDEX `customers_balance_idx` ON `customers` (`current_balance`);--> statement-breakpoint
CREATE INDEX `customers_active_idx` ON `customers` (`is_active`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`barcode` text,
	`discounted_price` real DEFAULT 0 NOT NULL,
	`category_id` text,
	`stock_quantity` integer DEFAULT 0 NOT NULL,
	`unit_price` real NOT NULL,
	`unit_amount` integer DEFAULT 1,
	`unit` text DEFAULT 'pcs',
	`description` text,
	`image_filename` text,
	`is_active` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_barcode_unique` ON `products` (`barcode`);--> statement-breakpoint
CREATE INDEX `products_name_idx` ON `products` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `products_barcode_idx` ON `products` (`barcode`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `products_stock_idx` ON `products` (`stock_quantity`);--> statement-breakpoint
CREATE INDEX `products_active_idx` ON `products` (`is_active`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`category` text DEFAULT 'general' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_idx` ON `settings` (`key`);--> statement-breakpoint
CREATE INDEX `settings_category_idx` ON `settings` (`category`);--> statement-breakpoint
CREATE TABLE `purchase_items` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_id` text NOT NULL,
	`product_id` text,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`total_price` real NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`purchase_id`) REFERENCES `purchases`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `purchase_item_id_idx` ON `purchase_items` (`id`);--> statement-breakpoint
CREATE INDEX `purchase_item_purchase_idx` ON `purchase_items` (`purchase_id`);--> statement-breakpoint
CREATE INDEX `purchase_item_product_idx` ON `purchase_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_description` text,
	`vendor_id` text NOT NULL,
	`total_amount` real DEFAULT 0 NOT NULL,
	`paid_amount` real DEFAULT 0 NOT NULL,
	`due_amount` real DEFAULT 0 NOT NULL,
	`purchase_status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`vendor_id`) REFERENCES `vendors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `purchases_id_idx` ON `purchases` (`id`);--> statement-breakpoint
CREATE INDEX `purchase_vendor_idx` ON `purchases` (`vendor_id`);--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `vendors_id_idx` ON `vendors` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `vendors_name_idx` ON `vendors` (`name`);--> statement-breakpoint
CREATE TABLE `transaction_items` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`product_id` text,
	`product_name` text NOT NULL,
	`product_barcode` text,
	`unit_price` real NOT NULL,
	`unit_amount` integer DEFAULT 1,
	`unit` text DEFAULT 'pcs',
	`quantity` real NOT NULL,
	`total_amount` real NOT NULL,
	`discount_amount` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `transaction_items_transaction_idx` ON `transaction_items` (`transaction_id`);--> statement-breakpoint
CREATE INDEX `transaction_items_product_idx` ON `transaction_items` (`product_id`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_number` text NOT NULL,
	`customer_id` text,
	`subtotal_amount` real NOT NULL,
	`discount_amount` real DEFAULT 0 NOT NULL,
	`tax_amount` real DEFAULT 0 NOT NULL,
	`total_amount` real NOT NULL,
	`payment_method` text NOT NULL,
	`cash_received` real,
	`change_given` real,
	`status` text DEFAULT 'completed' NOT NULL,
	`notes` text,
	`receipt_printed` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_transaction_number_unique` ON `transactions` (`transaction_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `transactions_number_idx` ON `transactions` (`transaction_number`);--> statement-breakpoint
CREATE INDEX `transactions_customer_idx` ON `transactions` (`customer_id`);--> statement-breakpoint
CREATE INDEX `transactions_payment_method_idx` ON `transactions` (`payment_method`);--> statement-breakpoint
CREATE INDEX `transactions_status_idx` ON `transactions` (`status`);--> statement-breakpoint
CREATE INDEX `transactions_date_idx` ON `transactions` (`created_at`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`password` text NOT NULL,
	`is_admin` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_idx` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`is_admin`);