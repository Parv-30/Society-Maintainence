-- AlterTable
ALTER TABLE "EmailOutbox" ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;
