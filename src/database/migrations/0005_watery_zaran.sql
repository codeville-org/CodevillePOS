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
	`last_updated_by` text NOT NULL,
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
CREATE INDEX `cashdrawer_event_user_id_idx` ON `cash_drawer_events` (`user_id`);