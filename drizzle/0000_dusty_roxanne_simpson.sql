CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`creator` text NOT NULL,
	`name` text NOT NULL,
	`base` text NOT NULL,
	`ingredients` text NOT NULL,
	`preparation` text NOT NULL,
	`notes` text NOT NULL,
	`created_at` integer NOT NULL
);
