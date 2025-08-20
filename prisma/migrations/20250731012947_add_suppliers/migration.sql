/*
  Warnings:

  - A unique constraint covering the columns `[CI]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `Password` VARCHAR(600) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_CI_key` ON `users`(`CI`);
