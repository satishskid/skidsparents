CREATE TABLE `blog_bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`blog_slug` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `care_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price_yearly` integer,
	`price_monthly` integer,
	`services_json` text,
	`discounts_json` text,
	`is_active` integer DEFAULT true
);
--> statement-breakpoint
CREATE UNIQUE INDEX `care_plans_name_unique` ON `care_plans` (`name`);--> statement-breakpoint
CREATE TABLE `chatbot_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`child_id` text,
	`messages_json` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `children` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`name` text NOT NULL,
	`dob` text NOT NULL,
	`gender` text,
	`photo_url` text,
	`blood_group` text,
	`allergies_json` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `content_engagement` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`content_type` text NOT NULL,
	`content_id` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `forum_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`parent_id` text NOT NULL,
	`author_name` text NOT NULL,
	`is_anonymous` integer DEFAULT false,
	`content` text NOT NULL,
	`likes` integer DEFAULT 0,
	`is_hidden` integer DEFAULT false,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`post_id`) REFERENCES `forum_posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `forum_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`emoji` text,
	`member_count` integer DEFAULT 0,
	`post_count` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `forum_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `forum_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`parent_id` text NOT NULL,
	`author_name` text NOT NULL,
	`is_anonymous` integer DEFAULT false,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`likes` integer DEFAULT 0,
	`comment_count` integer DEFAULT 0,
	`is_hidden` integer DEFAULT false,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`group_id`) REFERENCES `forum_groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `forum_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`target_type` text NOT NULL,
	`target_id` text NOT NULL,
	`reason` text,
	`status` text DEFAULT 'pending',
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `growth_records` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`date` text NOT NULL,
	`height_cm` real,
	`weight_kg` real,
	`head_circ_cm` real,
	`bmi` real,
	`who_zscore_json` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `habits_log` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`date` text NOT NULL,
	`habit_type` text NOT NULL,
	`value_json` text,
	`streak_days` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`category` text NOT NULL,
	`milestone_key` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'not_started',
	`observed_at` text,
	`parent_notes` text,
	`expected_age_min` integer,
	`expected_age_max` integer,
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`body` text,
	`data_json` text,
	`read` integer DEFAULT false,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `parent_observations` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`date` text NOT NULL,
	`category` text,
	`observation_text` text NOT NULL,
	`concern_level` text DEFAULT 'none',
	`ai_response` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `parents` (
	`id` text PRIMARY KEY NOT NULL,
	`firebase_uid` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`avatar_url` text,
	`city` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `parents_firebase_uid_unique` ON `parents` (`firebase_uid`);--> statement-breakpoint
CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`specializations_json` text,
	`location` text,
	`city` text,
	`rating` real,
	`is_verified` integer DEFAULT false,
	`commission_pct` real DEFAULT 15,
	`contact_email` text,
	`contact_phone` text,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE TABLE `screening_imports` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`source` text DEFAULT 'skids',
	`campaign_code` text,
	`imported_at` text DEFAULT (datetime('now')),
	`screening_date` text,
	`data_json` text,
	`four_d_json` text,
	`summary_text` text,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `service_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`child_id` text NOT NULL,
	`service_id` text NOT NULL,
	`status` text DEFAULT 'pending',
	`payment_id` text,
	`amount_cents` integer,
	`scheduled_at` text,
	`completed_at` text,
	`outcome_notes` text,
	`provider_id` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`short_description` text,
	`category` text NOT NULL,
	`delivery_type` text NOT NULL,
	`provider_type` text DEFAULT 'skids',
	`price_cents` integer NOT NULL,
	`currency` text DEFAULT 'INR',
	`price_model` text DEFAULT 'one_time',
	`duration` text,
	`image_url` text,
	`badge` text,
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT (datetime('now'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE TABLE `social_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`platform` text NOT NULL,
	`content_type` text NOT NULL,
	`content_id` text NOT NULL,
	`share_url` text NOT NULL,
	`utm_campaign` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`care_plan_id` text NOT NULL,
	`status` text DEFAULT 'active',
	`started_at` text,
	`expires_at` text,
	`payment_id` text,
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`care_plan_id`) REFERENCES `care_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `uploaded_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`file_url` text NOT NULL,
	`file_type` text,
	`file_name` text,
	`upload_date` text DEFAULT (datetime('now')),
	`ai_extracted_json` text,
	`provider_name` text,
	`report_type` text,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vaccination_records` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`vaccine_name` text NOT NULL,
	`dose` text,
	`administered_date` text,
	`provider` text,
	`next_due` text,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `whatsapp_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`phone` text NOT NULL,
	`is_subscribed` integer DEFAULT true,
	`subscription_type` text DEFAULT 'daily_tip' NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action
);
