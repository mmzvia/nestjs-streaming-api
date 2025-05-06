/*
  Warnings:

  - You are about to drop the column `uploaderId` on the `Video` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_uploaderId_fkey";

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "uploaderId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
