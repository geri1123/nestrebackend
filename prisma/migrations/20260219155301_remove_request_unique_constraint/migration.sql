-- DropForeignKey
ALTER TABLE `registrationrequest` DROP FOREIGN KEY `registrationrequest_user_id_fkey`;

-- DropIndex
DROP INDEX `RegistrationRequest_user_id_request_type_status_key` ON `registrationrequest`;

-- AddForeignKey
ALTER TABLE `agencyagent_permission` ADD CONSTRAINT `agencyagent_permission_agency_id_fkey` FOREIGN KEY (`agency_id`) REFERENCES `agency`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
