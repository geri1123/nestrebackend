-- DropForeignKey
ALTER TABLE `registrationrequest` DROP FOREIGN KEY `registrationrequest_user_id_fkey`;

-- DropIndex
DROP INDEX `RegistrationRequest_user_id_request_type_status_key` ON `registrationrequest`;
