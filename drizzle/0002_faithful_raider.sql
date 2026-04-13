CREATE TABLE `milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`milestoneType` enum('intake_started','intake_completed','documents_submitted','documents_approved','form_generated','form_submitted','under_review','decision_received','approved','rejected') NOT NULL,
	`status` enum('pending','completed','skipped') NOT NULL DEFAULT 'pending',
	`completedAt` timestamp,
	`notes` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `milestones_applicationId_idx` ON `milestones` (`applicationId`);--> statement-breakpoint
CREATE INDEX `milestones_milestoneType_idx` ON `milestones` (`milestoneType`);