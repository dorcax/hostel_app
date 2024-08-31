/*
  Warnings:

  - A unique constraint covering the columns `[otpCode]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Otp_otpCode_key" ON "Otp"("otpCode");
