-- Core schema migration (parents, children, PHR, marketplace, content)
-- Community tables already applied via 0002_community_tables.sql

CREATE TABLE IF NOT EXISTS `parents` (
	`id` text PRIMARY KEY NOT NULL,
	`firebase_uid` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`avatar_url` text,
	`city` text,
	`created_at` text DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS `parents_firebase_uid_unique` ON `parents` (`firebase_uid`);

CREATE TABLE IF NOT EXISTS `children` (
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

CREATE TABLE IF NOT EXISTS `milestones` (
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

CREATE TABLE IF NOT EXISTS `habits_log` (
	`id` text PRIMARY KEY NOT NULL,
	`child_id` text NOT NULL,
	`date` text NOT NULL,
	`habit_type` text NOT NULL,
	`value_json` text,
	`streak_days` integer DEFAULT 0,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `growth_records` (
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

CREATE TABLE IF NOT EXISTS `parent_observations` (
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

CREATE TABLE IF NOT EXISTS `screening_imports` (
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

CREATE TABLE IF NOT EXISTS `uploaded_reports` (
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

CREATE TABLE IF NOT EXISTS `vaccination_records` (
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

CREATE TABLE IF NOT EXISTS `services` (
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
CREATE UNIQUE INDEX IF NOT EXISTS `services_slug_unique` ON `services` (`slug`);

CREATE TABLE IF NOT EXISTS `service_orders` (
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

CREATE TABLE IF NOT EXISTS `providers` (
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

CREATE TABLE IF NOT EXISTS `care_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price_yearly` integer,
	`price_monthly` integer,
	`services_json` text,
	`discounts_json` text,
	`is_active` integer DEFAULT true
);
CREATE UNIQUE INDEX IF NOT EXISTS `care_plans_name_unique` ON `care_plans` (`name`);

CREATE TABLE IF NOT EXISTS `subscriptions` (
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

CREATE TABLE IF NOT EXISTS `blog_bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`blog_slug` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `content_engagement` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`content_type` text NOT NULL,
	`content_id` text NOT NULL,
	`action` text NOT NULL,
	`created_at` text DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS `chatbot_conversations` (
	`id` text PRIMARY KEY NOT NULL,
	`parent_id` text NOT NULL,
	`child_id` text,
	`messages_json` text,
	`created_at` text DEFAULT (datetime('now')),
	`updated_at` text DEFAULT (datetime('now')),
	FOREIGN KEY (`parent_id`) REFERENCES `parents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `notifications` (
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

-- leads table (used by /api/lead.ts, not in Drizzle schema)
CREATE TABLE IF NOT EXISTS `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`brand` text NOT NULL DEFAULT 'skids',
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`source` text NOT NULL,
	`medium` text,
	`campaign` text,
	`funnel_stage` text NOT NULL,
	`asset_code` text,
	`center` text DEFAULT 'online',
	`child_age_months` integer,
	`notes` text,
	`created_at` text DEFAULT (datetime('now'))
);
