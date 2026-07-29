CREATE TABLE `staff_login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`failures` integer NOT NULL,
	`blocked_until` integer NOT NULL,
	`updated_at` integer NOT NULL
);
