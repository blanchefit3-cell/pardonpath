CREATE TABLE `applicants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(100) NOT NULL,
	`lastName` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`dateOfBirth` timestamp,
	`sinEncrypted` text,
	`driversLicenseEncrypted` text,
	`province` varchar(2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applicants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicantId` int NOT NULL,
	`status` enum('intake','documents','review','submission','decision','completed','rejected') NOT NULL DEFAULT 'intake',
	`tier` enum('diy','done_with_you','done_for_you') NOT NULL,
	`offenseTypeEncrypted` text,
	`offenseDateEncrypted` text,
	`sentenceDetailsEncrypted` text,
	`eligibilityStatus` enum('pass','flag','ineligible'),
	`eligibilityReportUrl` text,
	`documentsApproved` boolean DEFAULT false,
	`formGenerated` boolean DEFAULT false,
	`formUrl` text,
	`paymentId` varchar(255),
	`paymentStatus` enum('pending','completed','failed') DEFAULT 'pending',
	`submittedToPBC` boolean DEFAULT false,
	`pbcDecision` enum('approved','denied','pending'),
	`paralegalAssignedId` int,
	`paralegalNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`details` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`documentType` enum('court_record','police_certificate','id_document','other') NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileSizeBytes` int,
	`mimeType` varchar(100),
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`aiReviewStatus` enum('pending','approved','flagged') DEFAULT 'pending',
	`aiReviewNotes` text,
	`humanReviewStatus` enum('pending','approved','rejected'),
	`humanReviewNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`recipientEmail` varchar(320),
	`recipientPhone` varchar(20),
	`notificationType` enum('eligibility_confirmed','document_approved','form_ready','submission_sent','decision_received','milestone_update') NOT NULL,
	`channel` enum('email','sms') NOT NULL,
	`status` enum('pending','sent','failed') DEFAULT 'pending',
	`externalId` varchar(255),
	`sentAt` timestamp,
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partnerClients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partnerId` int NOT NULL,
	`applicationId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `partnerClients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`businessNumber` varchar(20),
	`apiKey` varchar(255) NOT NULL,
	`apiKeyRotatedAt` timestamp DEFAULT (now()),
	`maxClients` int DEFAULT 100,
	`activeClients` int DEFAULT 0,
	`status` enum('active','inactive','suspended') DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partners_id` PRIMARY KEY(`id`),
	CONSTRAINT `partners_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `partners_apiKey_unique` UNIQUE(`apiKey`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`applicationId` int NOT NULL,
	`stripePaymentId` varchar(255) NOT NULL,
	`tier` enum('diy','done_with_you','done_for_you') NOT NULL,
	`amountCents` int NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'CAD',
	`status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`receiptUrl` text,
	`receiptSentAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_stripePaymentId_unique` UNIQUE(`stripePaymentId`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','paralegal','partner') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `applicants_userId_idx` ON `applicants` (`userId`);--> statement-breakpoint
CREATE INDEX `applications_applicantId_idx` ON `applications` (`applicantId`);--> statement-breakpoint
CREATE INDEX `applications_status_idx` ON `applications` (`status`);--> statement-breakpoint
CREATE INDEX `auditLogs_applicationId_idx` ON `auditLogs` (`applicationId`);--> statement-breakpoint
CREATE INDEX `auditLogs_timestamp_idx` ON `auditLogs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `documents_applicationId_idx` ON `documents` (`applicationId`);--> statement-breakpoint
CREATE INDEX `notifications_applicationId_idx` ON `notifications` (`applicationId`);--> statement-breakpoint
CREATE INDEX `partnerClients_partnerId_idx` ON `partnerClients` (`partnerId`);--> statement-breakpoint
CREATE INDEX `partnerClients_applicationId_idx` ON `partnerClients` (`applicationId`);--> statement-breakpoint
CREATE INDEX `partners_userId_idx` ON `partners` (`userId`);--> statement-breakpoint
CREATE INDEX `payments_applicationId_idx` ON `payments` (`applicationId`);--> statement-breakpoint
CREATE INDEX `payments_stripePaymentId_idx` ON `payments` (`stripePaymentId`);