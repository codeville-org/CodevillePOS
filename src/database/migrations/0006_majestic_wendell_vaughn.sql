PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cash_drawer_balance` (
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
INSERT INTO `__new_cash_drawer_balance`("id", "notes_5000", "notes_2000", "notes_1000", "notes_500", "notes_100", "notes_50", "notes_20", "coins_10", "coins_5", "coins_2", "coins_1", "total_amount", "is_active", "last_event_id", "last_updated_by", "created_at", "updated_at") SELECT "id", "notes_5000", "notes_2000", "notes_1000", "notes_500", "notes_100", "notes_50", "notes_20", "coins_10", "coins_5", "coins_2", "coins_1", "total_amount", "is_active", "last_event_id", "last_updated_by", "created_at", "updated_at" FROM `cash_drawer_balance`;--> statement-breakpoint
DROP TABLE `cash_drawer_balance`;--> statement-breakpoint
ALTER TABLE `__new_cash_drawer_balance` RENAME TO `cash_drawer_balance`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `cashdrawer_balance_id_idx` ON `cash_drawer_balance` (`id`);--> statement-breakpoint
CREATE INDEX `cashdrawer_balance_last_event_id_idx` ON `cash_drawer_balance` (`last_event_id`);--> statement-breakpoint
CREATE INDEX `cashdrawer_balance_last_updated_by_idx` ON `cash_drawer_balance` (`last_updated_by`);